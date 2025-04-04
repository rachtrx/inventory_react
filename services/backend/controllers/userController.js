const { sequelize, Sequelize, Event, Dept, Usr, AstType, AstSType, Ast, AstLoan, AccLoan, AccType, Loan, AccReturn, Rmk, Admin, UsrTag, UsrTagMap } = require('../models');
const { Op, where } = require('sequelize');
const logger = require('../logging.js');
const { getUserFilters, userFilters, getSortCondition } = require('./utils.js');
const UserDTO = require('../dtos/usr.dto.js');
const EventDTO = require('../dtos/event.dto.js');

class UserController {

    async getAllFilters(req, res) {
        try {
            const optionsDict = Object.fromEntries(
                await Promise.all(
                    userFilters.map(async (field) => [field, await getUserFilters(field)])
                )
            );
            return res.json(optionsDict)
        } catch (error) {
            logger.error(error);
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async getFilters (req, res) {
        const { field } = req.body;
    
        try {
            const options = await getUserFilters(field);
            // console.log(options);
            return res.json(options || []);
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async getUsers (req, res) {
        try {
            const { filters={}, sort, page = 1, limit = 30 } = req.query; // Ensure proper query param parsing
            console.log(req.query);
    
            const usersExist = await Usr.count();
            
            if (usersExist === 0) {
                return res.json({
                    data: [],
                    totalCount: 0,
                    totalPages: 1,
                    currentPage: 1
                });
            }

            const sortFieldLookup = {
                "userName": '"user_name"',
                "deptName": '"Dept"."dept_name"',
            }

            let sortCondition;
            if (sort?.length === 2) sortCondition = getSortCondition(sortFieldLookup, sort);

            // console.log(filters.userName);
            
            // SELECT ALL rows that either/both pending astLoan or pending accLoans → Removes all other LOANs 
            const whereClause = {
                [Op.and]: [
                    ...(filters.userName ? [{ userName: { [Op.iLike]: `%${filters.userName}%` } }] : []),
                    ...(filters.bookmarked === true ? [{ bookmarked: true }] : []),
                    ...(filters.assetCount?.length === 2
                        ? [Sequelize.literal(`
                            EXISTS (
                                SELECT 1
                                FROM "usrs"
                                LEFT JOIN "loans" AS "UserLoans" ON "usrs"."id" = "UserLoans"."user_id"
                                AND "UserLoans"."loan_event_id" IS NOT NULL -- unreturned loans
                                LEFT JOIN "ast_loans" AS "AstLoans" ON "AstLoans"."loan_id" = "UserLoans"."id"
                                AND "AstLoans"."return_event_id" IS NULL
                                WHERE "usrs"."id" = "Usr"."id"
                                GROUP BY "usrs"."id"
                                HAVING COALESCE(COUNT(DISTINCT "AstLoans"."id"), 0) BETWEEN ${filters.assetCount[0]} AND ${filters.assetCount[1]}
                            )
                        `)] : []
                    ),
                    // ...(filters.accessoryCount?.length === 2 // TODO, add accessory count filter soon?
                    //     ? [Sequelize.where(
                    //         Sequelize.literal(`
                    //             (
                    //                 SELECT COALESCE(SUM("AccLoan"."count"), 0) 
                    //                 FROM "acc_loans" AS "AccLoan"
                    //                 JOIN "loans" AS "UserLoans" ON "AccLoan"."loan_id" = "UserLoans".id
                    //                 WHERE "UserLoans"."user_id" = "Loans"."user_id"
                    //             )
                    //             -
                    //             (
                    //                 SELECT COALESCE(SUM("AccReturns"."count"), 0) 
                    //                 FROM "acc_returns" AS "AccReturns"
                    //                 JOIN "acc_loans" AS "AccLoan" ON "AccReturns"."acc_loan_id" = "AccLoan"."id"
                    //                 JOIN "loans" AS "UserLoans" ON "AccLoan"."loan_id" = "UserLoans".id
                    //                 WHERE "UserLoans"."user_id" = "Loans"."user_id"
                    //             )
                    //             BETWEEN ${filters.accessoryCount[0]} AND ${filters.accessoryCount[1]}
                    //         `)
                    //     )] : []
                    // ),
                ],
            };
            

            // IMPT allow reservations
    
            const query = await Usr.findAll({
                attributes: ['id', 'userName', 'bookmarked'],
                logging: console.log,
                include: [
                    {
                        model: UsrTagMap,
                        attributes: ['id'],
                        where: { delEventId: { [Op.eq]: null } },
                        include: {
                            model: UsrTag,
                            attributes: ['id', 'tagName'],
                            ...(filters?.userTag?.length && { where: { id: { [Op.in]: filters.userTag } } }),
                        },
                        required: filters?.userTag?.length ? true : false,
                    },
                    {
                        model: Event,
                        as: 'AddEvent',
                        attributes: ['eventDate'],
                    },
                    {
                        model: Event,
                        as: 'DeleteEvent',
                        attributes: ['eventDate'],
                        required: false,
                    },
                    {
                        model: Loan,
                        required: false,
                        include: [
                            {
                                model: AstLoan,
                                required: false,
                                where: {
                                    returnEventId: {
                                        [Op.eq]: null,
                                    }
                                },
                                include: [
                                    {
                                        model: Ast,
                                        required: true,
                                        attributes: ['id', 'alias', 'serialNumber', 'bookmarked'],
                                        include: {
                                            model: AstSType,
                                            required: true,
                                            attributes: ['id', 'subTypeName'],
                                            include: {
                                                model: AstType,
                                                required: true,
                                                attributes: ['id', 'typeName'],
                                            },
                                        },
                                    },
                                ],
                            },
                            {
                                model: AccLoan,
                                required: false,
                                attributes: ['id', 'count'],
                                where: Sequelize.literal(`
                                    NOT EXISTS (
                                        SELECT 1
                                        FROM "acc_returns" AS "AccReturns"
                                        WHERE "AccReturns"."acc_loan_id" = "Loans->AccLoans"."id"
                                        GROUP BY "Loans->AccLoans"."id"
                                        HAVING COALESCE(SUM("AccReturns"."count"), 0) = "Loans->AccLoans"."count"
                                    )
                                `),
                                include: [
                                    {
                                        model: AccType,
                                        required: true,
                                        attributes: ['id', 'accessoryName'],
                                    },
                                    {
                                        model: AccReturn, // Need to calculate remaining count later
                                        attributes: ['id', 'count'],
                                        required: false,
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        model: Dept,
                        required: true,
                        attributes: ['deptName'],
                        ...(filters?.deptName?.length && { where: { id: { [Op.in]: filters.deptName } } }),
                    },
                ],
                where: whereClause || {},
                order: sortCondition ? [sortCondition] : [[{ model: Event, as: 'AddEvent' }, 'eventDate', 'DESC']], // Handle sorting dynamically
            });
            
            const count = query.length;
            const rows = query.slice((page - 1) * limit, page * limit);
            
            let result = rows.map(userRow => {
                return new UserDTO(userRow).setOngoingLoans().setOngoingReservations();
            });
            
            // logger.info(result.slice(0, 10));
            
            res.json({
                data: result,
                totalCount: count, // Total users count
                totalPages: Math.ceil(count / limit), // Calculate total pages
                currentPage: parseInt(page, 10),
            });
            
        } catch (error) {
            console.error('Error fetching user views:', error);
            res.status(500).send({ error: error.message });
        }
    };
    
    getUser = async (req, res) => {
        const userId = req.params.id;
    
        try {
            const userDetails = await Usr.findByPk(userId, {
                attributes: ['id', 'userName', 'email', 'bookmarked'],
                include: [
                    {
                        model: UsrTagMap,
                        attributes: ['id'],
                        where: { delEventId: { [Op.eq]: null }}, 
                        include: {
                            model: UsrTag,
                            attributes: ['id', 'tagName'],
                        },
                        required: false
                    },
                    {
                        model: Dept,
                        attributes: ['id', 'deptName']
                    }
                ],
            });

            if (!userDetails) return res.status(404).send({ error: "User not found" });

            const user = new UserDTO(userDetails)
    
            user.history = await this.getAllEvents(user.userId);

            if (user.history && user.history.length > 0) {

                user.pastAssets = user.history
                    .filter(event => event.loan?.astLoan && event.loan.astLoan.returnEvent)
                    .map(event => event.loan.astLoan.asset)

                user.loans = user.history
                    .filter(event => (event.loan?.astLoan && !event.loan.astLoan.returnEvent) || 
                        (event.loan?.accLoans?.some(accLoan => accLoan.unreturned > 0))
                    ).map(event => event.loan);
            }
    
            logger.info('Details for Usr:', user);
    
            res.json(user);
        } catch (error) {
            logger.error("Error fetching user details:", error);
            res.status(500).send({ error: error.message });
        }
    };

    async getAllEvents(userId) {
        const eventRows = await Event.findAll({
            attributes: ['id', 'adminId', 'eventDate'],
            where: {
                [Op.or]: [
                    { '$AddedUser.id$': userId },
                    { '$DeletedUser.id$': userId },
                    { '$Loan.user_id$': userId },
                    { '$Reservation.user_id$': userId } // TODO is it possible to extract out other users of that loan?
                ]
            },
            include: [
                {
                    model: Rmk,
                    attributes: ['id', 'text'],
                    required: false,
                    include: {
                        model: Admin,
                        attributes: ['id', 'adminName'],
                        required: false
                    },
                },
                {
                    model: Admin,
                    attributes: ['id', 'adminName'],
                    required: false
                },
                {
                    model: Usr,
                    as: 'AddedUser',
                    attributes: ['id'],
                    required: false
                },
                {
                    model: Usr,
                    as: 'DeletedUser',
                    attributes: ['id'],
                    required: false
                },
                {
                    model: Loan,
                    as: 'Loan',
                    required: false,
                    include: [
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            required: false,
                            include: [
                                {
                                    model: Event,
                                    as: 'ReturnEvent',
                                    attributes: ['id', 'eventDate'],
                                    required: false,
                                    include: [
                                        {
                                            model: Rmk,
                                            attributes: ['id', 'text', 'remarkDate'],
                                            include: {
                                                model: Admin,
                                                attributes: ['id', 'adminName'],
                                                required: false
                                            }
                                        },
                                        {
                                            model: Admin,
                                            attributes: ['id', 'adminName'],
                                            required: false
                                        }
                                    ]
                                },
                                {
                                    model: Ast,
                                    attributes: ['id', 'serialNumber', 'alias', 'bookmarked'],
                                    include: {
                                        model: AstSType,
                                        attributes: ['subTypeName'],
                                        include: {
                                            model: AstType,
                                            attributes: ['typeName']
                                        }
                                    },
                                    required: true
                                }
                            ]
                        },
                        {
                            model: AccLoan,
                            attributes: ['id', 'count'],
                            required: false,
                            include: [
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName'],
                                    required: true
                                },
                                {
                                    model: AccReturn,
                                    attributes: ['id', 'count'],
                                    required: false,
                                    include: {
                                        model: Event,
                                        as: 'ReturnEvent',
                                        attributes: ['id', 'eventDate'],
                                        required: true,
                                        include: [
                                            {
                                                model: Rmk,
                                                attributes: ['id', 'text', 'remarkDate'],
                                                include: {
                                                    model: Admin,
                                                    attributes: ['id', 'adminName'],
                                                    required: false
                                                }
                                            },
                                            {
                                                model: Admin,
                                                attributes: ['id', 'adminName'],
                                                required: false
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            model: Usr,
                            attributes: ['id', 'userName'],
                        },
                    ]
                },
                {
                    model: Loan,
                    required: false,
                    as: 'Reservation',
                    include: [
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            required: false
                        },
                        {
                            model: AccLoan,
                            attributes: ['id', 'count'],
                            required: false,
                            include: [
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName']
                                }
                            ]
                        },
                        {
                            model: Usr,
                            attributes: ['id', 'userName'],
                        }
                    ]
                }
            ],
            order: [['eventDate', 'DESC']]
        });

        const events = eventRows.map(row => new EventDTO(row)); // Converts Sequelize instances to plain objects
        logger.info(events);

        return events;
    }

    updateUser = async (req, res, next) => {
        const { name, itemId, newValue } = req.body;
    
        try {
            if (name === 'deptName') {
                if (req.body.updateType === 'update-delete') {
                    await this.replaceUserDept(req.body)
                } else {
                    await this.updateUserDept(req.body)
                }
                res.json({ message: "User updated successfully" });
            } else {
                const user = await Usr.findByPk(itemId);
        
                if (user) {
                    user[name] = newValue;
                    await user.save();
                    res.json({ message: "User updated successfully" });
                } else {
                    res.status(404).json({ message: "Usr not found" });
                }
            }
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    updateUserDept = async(metadata) => {
        let {itemId, name, newId, newValue, updateType } = metadata;
        const t = await sequelize.transaction();
        try {
            let existingDept = await Dept.findByPk(newId);

            if (!existingDept) throw new Error(`${newValue} must be created first!`)
            
            let currentUser = await Usr.findByPk(itemId);
            if (updateType === "update-one") {
                await currentUser.update({ deptId : existingDept.id })
            } else {
                await Usr.update(
                    { deptId: existingDept.id },
                    {
                        where: {
                            deptId: currentUser.deptId
                        }
                    }
                )
            }
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    replaceUserDept = async(metadata) => {
        const { oldId, newId, newValue } = metadata;

        const t = await sequelize.transaction();

        try {
            const existingRow = await Dept.findOne({
                where: { id: newId },
                transaction: t
            });
    
            if (existingRow) {
                // Point all references to newId
                await Usr.update(
                    { deptId: newId },
                    {
                        where: { deptId: oldId },
                        transaction: t,
                    }
                );
                // Delete old entry
                await Dept.destroy({
                    where: { id: oldId },
                    transaction: t
                });
            } else {
                // Just rename
                await Dept.update(
                    { deptName: newValue },
                    {
                        where: { id: oldId },
                        transaction: t,
                    }
                );
            }
    
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}    

module.exports = new UserController();