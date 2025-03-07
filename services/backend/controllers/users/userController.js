const { sequelize, Sequelize, Event, Dept, Usr, AstType, AstSType, Ast, AstLoan, AccLoan, AccType, Loan, AccReturn, Rmk, Admin, UsrTag, UsrTagMap, UsrDelete, AstReturn, UsrTagMapDel } = require('../../models');
const { Op, where } = require('sequelize');
const logger = require('../../logging.js');
const { createSelection, getAllOptions, getDistinctOptions } = require('../utils.js');
const UserDTO = require('../../dtos/usr.dto.js');
const EventDTO = require('../../dtos/event.dto.js');
const { pendingOrCancelledEventCondition, assetReturnedQuery, accessoryReturnedQuery, successfulEventCondition } = require('../utils.js');

class UserController {

    async getFilters (req, res) {
        const { field } = req.body;
    
        let options;
        try {
            if (['deptName', 'tag'].includes(field)) {
                let meta = null;
                switch(field) {
                    case 'deptName':
                        meta = [Dept, 'deptName', 'id'];
                        break;
                    case 'tag':
                        meta = [UsrTag, 'tagName', 'id'];
                        break;
                }
                logger.info(meta)
                options = await getAllOptions(meta)
                
            } else if (field === 'assetCount') {
                const result = await AstLoan.findAll({
                    attributes: [
                        [Sequelize.col('"Loan->Usr"."id"'), 'userId'],
                        [Sequelize.fn('COUNT', Sequelize.col('*')), 'assetCount']
                    ],
                    include: {
                        model: Loan,
                        attributes: [],
                        required: true,
                        include: [
                            {
                                model: Usr,
                                attributes: [],
                            },
                            {
                                model: Event,
                                attributes: [],
                                where: successfulEventCondition(),
                                required: true,
                            }
                        ],
                    },
                    where: Sequelize.literal(`NOT EXISTS (
                        SELECT 1
                        FROM "ast_returns" AS "AstReturns"
                        JOIN "events" AS "AstReturns->Event" ON "AstReturns->Event"."id" = "AstReturns"."event_id"
                        WHERE "AstReturns"."ast_loan_id" = "AstLoan"."id"
                        AND "AstReturns->Event"."cancelled" = FALSE
                        AND "AstReturns->Event"."closed_date" IS NOT NULL
                    )`),
                    group: [
                        '"Loan->Usr"."id"', // Only group by userId
                    ],
                    raw: true
                });
                const counts = result.map(item => item.assetCount);
                const distinctCounts = [...new Set(counts)];
                options = distinctCounts.map((count) => ({
                    label: count,
                    value: count,
                })).sort((a, b) => a.value - b.value)
            }
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
                ...(filters.bookmarked && { bookmarked: 1 }),
            };
    
            let query = await Usr.findAll({
                attributes: ['id', 'userName', 'bookmarked'],
                include: [
                    {
                        model: UsrTagMap,
                        attributes: ['id'],
                        include: [
                            {
                                model: UsrTag,
                                attributes: ['id', 'tagName'],
                                ...(filters.tag.length > 0 && { where: { id: { [Op.in]: filters.tag } } }),
                            },
                            {
                                model: UsrTagMapDel,
                                include: {
                                    model: Event,
                                    where: pendingOrCancelledEventCondition()
                                },
                                required: false
                            }
                        ],
                        required: filters.tag.length > 0 ? true : false
                    },
                    {
                        model: Event,
                        attributes: ['id', 'openedDate', 'closedDate'],
                    },
                    {
                        model: UsrDelete,
                        include: {
                            model: Event,
                            attributes: ['id', 'closedDate'],
                            where: successfulEventCondition(),
                            required: false,
                        },
                        required: false
                    },
                    {
                        model: Loan,
                        required: false,
                        attributes: ['id', 'eventId'],
                        include: [
                            {
                                model: Event,
                                where: { cancelled: false } // LOANED OR PENDING LOANS
                            },
                            {
                                model: AstLoan,
                                required: false,
                                attributes: ['id'],
                                include: {
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
                                where: Sequelize.literal(`NOT EXISTS ( -- Asset already returned
                                    SELECT 1
                                    FROM "ast_returns" AS "AstReturns"
                                    JOIN "events" AS "AstReturns->Event" ON "AstReturns->Event"."id" = "AstReturns"."event_id"
                                    WHERE "AstReturns"."ast_loan_id" = "Loans->AstLoan"."id"
                                    AND "AstReturns->Event"."cancelled" = FALSE
                                    AND "AstReturns->Event"."closed_date" IS NOT NULL
                                )`),
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
                                        model: AccReturn,
                                        required: false,
                                        include: {
                                            model: Event,
                                            where: { cancelled: false }
                                        },
                                    },
                                ],
                                where: Sequelize.literal(`NOT EXISTS ( -- All accessories returned
                                    SELECT 1 
                                    FROM "acc_returns" AS "AccReturns"
                                    JOIN "events" AS "AccReturns->Event" 
                                        ON "AccReturns->Event"."id" = "AccReturns"."event_id"
                                        AND "AccReturns->Event"."cancelled" = FALSE
                                        AND "AccReturns->Event"."closed_date" IS NOT NULL
                                    WHERE "AccReturns"."acc_loan_id" = "Loans->AccLoans"."id"
                                    GROUP BY "AccReturns"."acc_loan_id"
                                    HAVING COALESCE(SUM("AccReturns"."count"), 0) = "AccLoans"."count"
                                )`),
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
                where: whereClause,
                order: [[{ model: Event }, 'closedDate', 'DESC']],
                // order: [[Sequelize.literal('"AddEvent"."event_date"'), 'DESC']],
            });

            logger.info(query.slice(1, 10).map(user => user.get({plain: true})));
    
            if (filters.assetCount.length > 0) {
                filters.assetCount = filters.assetCount.map(count => parseInt(count, 10));
                query = query.filter(user => {
                    return filters.assetCount.includes(user.Loans.length)
                });
            };
            
            // Mapping over the result to modify each user object
            const result = query.map(user => {
                return new UserDTO(user);
            });
    
            logger.info(result.slice(10, 20));
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
                        model: Dept,
                        attributes: ['id', 'deptName']
                    },
                    {
                        model: UsrTagMap,
                        include: [
                            {
                                model: UsrTag,
                                attributes: ['id', 'tagName']
                            },
                            {
                                model: UsrTagMapDel,
                                include: {
                                    model: Event,
                                    where: pendingOrCancelledEventCondition()
                                },
                                required: false
                            }
                        ],
                        required: false
                    },
                ],
            });

            if (!userDetails) return res.status(404).send({ error: "User not found" });

            const user = new UserDTO(userDetails);
    
            user.history = await this.getAllEvents(user.userId);

            if (user.history && user.history.length > 0) {

                user.pastAssets = user.history
                    .filter(event => event.loan?.astLoan && 
                        event.loan.astLoan.astReturns.some(
                            astReturn => !astReturn.event.cancelled && astReturn.event.closedDate
                        )
                    )
                    .map(event => event.loan.astLoan.asset)

                user.currentAssets = user.history
                    .filter(event => event.loan?.astLoan && 
                        event.loan.astLoan.astReturns.every(
                            astReturn => !astReturn.event.closedDate || astReturn.event.cancelled
                        )
                    )
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
            attributes: ['id', 'adminId', 'openedDate', 'closedDate', 'expectedCloseDate', 'cancelled'],
            where: {
                [Op.or]: [
                    { '$Usr.id$': userId },
                    { '$UsrDelete.user_id$': userId },
                    { '$Loan.user_id$': userId },
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
                    as: 'OpenedAdmin',
                    attributes: ['id', 'adminName'],
                    required: false
                },
                {
                    model: Admin,
                    as: 'ClosedAdmin',
                    attributes: ['id', 'adminName'],
                    required: false
                },
                {
                    model: Usr,
                    attributes: ['id'],
                    required: false
                },
                {
                    model: UsrDelete,
                    attributes: ['id'],
                    required: false
                },
                {
                    model: Loan,
                    as: 'Loan',
                    required: false,
                    attributes: ['filepath'],
                    include: [
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            required: false,
                            include: [
                                assetReturnedQuery(),
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
                                accessoryReturnedQuery(),
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName'],
                                    required: true
                                }
                            ]
                        },
                        {
                            model: Usr,
                            attributes: ['id', 'userName'],
                        },
                    ]
                },
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