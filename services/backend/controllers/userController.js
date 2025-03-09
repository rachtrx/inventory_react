const { sequelize, Sequelize, Event, Dept, Usr, AstType, AstSType, Ast, AstLoan, AccLoan, AccType, Loan, AccReturn, Rmk, Admin, UsrTag, UsrTagMap } = require('../models');
const { Op, where } = require('sequelize');
const logger = require('../logging.js');
const { createSelection, getAllOptions, getDistinctOptions, getUserFilters } = require('./utils.js');
const UserDTO = require('../dtos/usr.dto.js');
const EventDTO = require('../dtos/event.dto.js');

class UserController {

    async getFilters (req, res) {
        const { field } = req.body;
    
        try {
            const options = await getUserFilters(field);
            // console.log(options);
            return res.json(options || []);
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    async getUsers (req, res) {
        try {
            const { filters } = req.body
            logger.info(filters)
    
            const usersExist = await Usr.count();
            
            if (usersExist === 0) {
                return res.json([]);
            }

            // console.log(filters.userName);
    
            const whereClause = {
                ...(filters.userName && { userName: { [Op.iLike]: `%${filters.userName}%` } }),
                ...(filters.bookmarked && { bookmarked: true }),
            };

            // IMPT allow reservations
    
            let query = await Usr.findAll({
                attributes: ['id', 'userName', 'bookmarked'],
                include: [
                    {
                        model: UsrTagMap,
                        attributes: ['id'],
                        where: { delEventId: { [Op.eq]: null }}, 
                        include: {
                            model: UsrTag,
                            attributes: ['id', 'tagName'],
                            ...(filters.userTag.length > 0 && { where: { id: { [Op.in]: filters.userTag } } }),
                        },
                        required: filters.userTag.length > 0 ? true : false
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
                                attributes: ['id', 'returnEventId'],
                                include: [
                                    {
                                        model: Ast,
                                        required: true,
                                        attributes: ['id', 'assetTag', 'serialNumber', 'bookmarked'],
                                        include: {
                                            model: AstSType,
                                            required: true,
                                            attributes: ['id', 'subTypeName'],
                                            include: {
                                                model: AstType,
                                                required: true,
                                                attributes: ['id', 'typeName']
                                            }
                                        }
                                    },
                                ],
                                where: {
                                    returnEventId: {
                                        [Op.is]: null
                                    }
                                },
                            },
                            {
                                model: AccLoan,
                                required: false,
                                attributes: ['id', 'count'],
                                include: [
                                    {
                                        model: AccType,
                                        required: true,
                                        attributes: ['id', 'accessoryName'],
                                    },
                                    {
                                        model: AccReturn, // need to calculate the remainder later
                                        attributes: ['id', 'count'],
                                        required: false,
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        model: Dept,
                        required: true,
                        attributes: ['deptName'],
                        ...(filters.deptName.length > 0 && { where: { id: { [Op.in]: filters.deptName } } }),
                    }
                ],
                where: {[Op.and]: [
                    whereClause,
                    Sequelize.literal(`
                        NOT EXISTS (
                            SELECT 1
                            FROM "acc_returns" AS "AccReturns"
                            WHERE "AccReturns"."acc_loan_id" = "Loans->AccLoans"."id"
                            GROUP BY "Loans->AccLoans"."id"
                            HAVING COALESCE(SUM("AccReturns"."count"), 0) = "Loans->AccLoans"."count"
                        )
                    `),
                    Sequelize.literal(`
                        NOT EXISTS (
                            SELECT 1 FROM "ast_loans" AS "AstLoans"
                            WHERE "AstLoans"."id" = "Loans->AstLoan"."id"
                            AND "AstLoans"."return_event_id" IS NOT NULL
                        )
                    `)
                ]},
                order: [[{ model: Event, as: 'AddEvent' }, 'eventDate', 'DESC']],
                // order: [[Sequelize.literal('"AddEvent"."event_date"'), 'DESC']],
            });

            // logger.info(query.slice(1, 10).map(user => user.get({plain: true})));
    
            if (filters.assetCount.length > 0) {
                filters.assetCount = filters.assetCount.map(count => parseInt(count, 10));
                query = query.filter(user => {
                    return filters.assetCount.includes(user.Loans.length)
                });
            };
            
            // Mapping over the result to modify each user object
            const result = query.map(user => {

                const initialUser = new UserDTO(user);
                
                initialUser.loans = initialUser.loans.filter(loan => {
                    if (loan.accLoans?.length) {
                        loan.accLoans = loan.accLoans.filter(accLoan => accLoan.unreturned > 0)
                    }

                    return loan.accLoans?.length || loan.astLoan; 
                })

                return initialUser;
            });
            
    
            // logger.info(result.slice(10, 20));
            res.json(result);
        } catch (error) {
            console.error('Error fetching user views:', error);
            res.status(500).send('Internal Server Error');
        }
    };
    
    getUser = async (req, res) => {
        const userId = req.params.id;
    
        try {
            const userDetails = await Usr.findByPk(userId, {
                attributes: ['id', 'userName', 'bookmarked'],
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

            const user = new UserDTO(userDetails);
    
            user.history = await this.getAllEvents(user.userId);

            if (user.history && user.history.length > 0) {

                user.pastAssets = user.history
                    .filter(event => event.loan?.astLoan && event.loan.astLoan.returnEvent)
                    .map(event => event.loan.astLoan.asset)

                user.currentAssets = user.history
                    .filter(event => event.loan?.astLoan && !event.loan.astLoan.returnEvent)
                    .map(event => event.loan.astLoan.asset)
            }
    
            logger.info('Details for Usr:', user);
    
            res.json(user);
        } catch (error) {
            logger.error("Error fetching user details:", error);
            res.status(500).send({ error: "Internal server error" });
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
                                    required: false
                                },
                                {
                                    model: Ast,
                                    attributes: ['id', 'serialNumber', 'assetTag', 'bookmarked'],
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
                                        required: true
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
                            model: Event,
                            as: 'CancelEvent',
                            attributes: ['id', 'eventDate'],
                            required: false
                        },
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

    async updateUser(req, res) {
        const { id, field, newValue } = req.body;
    
        try {
            const user = await Usr.findByPk(id);
    
            if (user) {
                user[field] = newValue;
                await user.save();
                res.json({ message: "Bookmark updated successfully" });
            } else {
                res.status(404).json({ message: "Usr not found" });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).send('Internal Server Error');
        }
    };
}    

module.exports = new UserController();