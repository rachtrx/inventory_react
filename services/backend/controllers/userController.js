const { sequelize, Sequelize, Event, Dept, Usr, AstType, AstSType, Ast, AstLoan, UsrLoan, AccLoan, AccType, Loan, AccReturn, Rmk, Admin } = require('../models');
const { Op, where } = require('sequelize');
const logger = require('../logging.js');
const { createSelection, getAllOptions, getDistinctOptions } = require('./utils.js');
const UserDTO = require('../dtos/usr.dto.js');
const EventDTO = require('../dtos/event.dto.js');

class UserController {

    async getFilters (req, res) {
        const { field } = req.body;
    
        let options;
        try {
            if (field === 'deptName') {
                const meta = [Dept, 'deptName', 'id'];
                logger.info(meta)
                options = await getAllOptions(meta)
                
            } else if (field === 'assetCount') {
                const result = await AstLoan.findAll({
                    attributes: [
                        [Sequelize.col('"Loan->UsrLoans"."user_id"'), 'userId'], // Get userId instead of Loan->UsrLoans.id
                        [Sequelize.fn('COUNT', Sequelize.col('"AstLoan"."id"')), 'assetCount']
                    ],
                    include: {
                        model: Loan,
                        attributes: [],
                        include: {
                            model: UsrLoan,
                            attributes: [], // We don't need the id here since we’re focusing on userId
                            include: {
                                model: Usr,
                                attributes: [],
                            },
                        }
                    },
                    where: { returnEventId: null },
                    group: [
                        '"Loan->UsrLoans"."user_id"' // Only group by userId
                    ],
                    raw: true
                });
                const counts = result.map(item => item.assetCount);
                const distinctCounts = [...new Set(counts)];
                options = distinctCounts.map((count) => ({
                    label: count,
                    value: count,
                }))
            }
            console.log(options);
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
    
            const whereClause = {
                ...(filters.userName && { userName: { [Op.iLike]: filters.userName } }),
            };
    
            let query = await Usr.findAll({
                attributes: ['id', 'userName', 'bookmarked'],
                include: [
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
                        model: UsrLoan,
                        required: false,
                        attributes: ['id'],
                        include: {
                            model: Loan,
                            required: true,
                            attributes: [
                                'id', 
                                'reserveEventId', 
                                'cancelEventId', 
                                'expectedReturnDate', 
                                'loanEventId'
                            ],
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
                                            model: AccReturn,
                                            required: false,
                                            where: {
                                                returnEventId: {
                                                    [Op.is]: null
                                                }
                                            }
                                        }
                                    ],
                                },
                            ],
                        }
                    },
                    {
                        model: Dept,
                        required: true,
                        attributes: ['deptName'],
                        ...(filters.dept.length > 0 && { where: { id: { [Op.in]: filters.dept } } }),
                    }
                ],
                where: whereClause
                // TODO
                // order: [['addedDate', 'DESC']],
            });

            logger.info(query.slice(1, 10).map(user => user.get({plain: true})));
    
            if (filters.assetCount.length > 0) {
                filters.assetCount = filters.assetCount.map(count => parseInt(count, 10));
                query = query.filter(user => {
                    return filters.assetCount.includes(user.AstLoans.length);
                });
            }
            
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
                include: {
                    model: Dept,
                    attributes: ['id', 'deptName']
                },
                attributes: ['id', 'userName', 'bookmarked']
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
                    { '$Loan->UsrLoans.user_id$': userId },
                    { '$Reservation->UsrLoans.user_id$': userId } // TODO is it possible to extract out other users of that loan?
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
                            model: UsrLoan,
                            attributes: ['filepath'],
                            include: {
                                model: Loan,
                                required: true,
                                include: {
                                    model: UsrLoan,
                                    required: false,
                                    include: {
                                        model: Usr,
                                        attributes: ['id', 'userName']
                                    },
                                    where: { id: { [Op.ne]: userId }}
                                }
                            }
                        }
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
                            model: UsrLoan,
                            attributes: ['filepath'],
                            include: {
                                model: Loan,
                                required: true,
                                include: {
                                    model: UsrLoan,
                                    required: false,
                                    include: {
                                        model: Usr,
                                        attributes: ['id', 'userName']
                                    },
                                    where: { id: { [Op.ne]: userId }}
                                }
                            }
                        },
                    ]
                }
            ],
            order: [['eventDate', 'DESC']]
        });

        const events = eventRows.map(row => new EventDTO(row)); // Converts Sequelize instances to plain objects
        logger.info(events);

        return events;
    }

    userIsDeleted = (user) => !!user.deletedDate
    userHasNoAsset = (user) => user.loanCount === 0 && user.reserveCount === 0

    searchUsersLoan = async (req, res) => {
        try {
            const { value } = req.query;
            const orderByClause = `
                ORDER BY
                    "deletedDate" IS NOT NULL ASC,
                    "lastEventDate" DESC
            `;
    
            const data = await this.searchUsers(value, orderByClause, this.userIsDeleted)
            return res.json(data);
        } catch (error) {
            logger.error('Error fetching users:', error)
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        }
        
    }
    
    searchUsersDelete = async (req, res) => {
        try {
            const { value } = req.query;
            const orderByClause = `
                ORDER BY 
                    "deletedDate" IS NOT NULL ASC,
                    ("reserveCount" = 0 AND "loanCount" = 0) DESC,
                    "reserveCount" = 0 DESC,
                    "loanCount" = 0 DESC,
                    "lastEventDate" DESC
            `;

            const data = await this.searchUsers(value, orderByClause, this.userHasNoAsset)
            return res.json(data);
        } catch (error) {
            logger.error('Error fetching users:', error)
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async searchUsers (value, orderByClause, disabledCondition) {

        const isBulkSearch = Array.isArray(value) ? true : false;
        const searchTerm = isBulkSearch ? value : `%${value}%`;

        const bulkCondition = `
            usrs.user_name IN (:searchTerm)  -- Bulk search condition
        `;

        const singleCondition = `
            usrs.user_name ILIKE :searchTerm  -- Single search condition
        `;
        
        const sql = `
            WITH UserLoanCounts AS (
                SELECT 
                    usrs.id, 
                    usrs.user_name AS name, 
                    usrs.bookmarked, 
                    delete_event.event_date AS "deletedDate",
                    depts.dept_name AS dept,
                    GREATEST(
                        MAX(delete_event.event_date),
                        MAX(add_event.event_date),
                        MAX(loan_event.event_date),
                        MAX(return_event.event_date),
                        MAX(reserve_event.event_date),
                        MAX(cancel_event.event_date)
                    ) AS "lastEventDate",
                    COUNT(loan_event.id) - COUNT(return_event.id) AS "loanCount",
                    SUM(
                        CASE 
                            WHEN loan_event.id IS NULL 
                                AND return_event.id IS NULL 
                                AND cancel_event.id IS NULL 
                                AND reserve_event.id IS NOT NULL THEN 1 
                            ELSE 0
                        END
                    ) AS "reserveCount"
                FROM usrs
                LEFT JOIN usr_loans ON usrs.id = usr_loans.user_id
                LEFT JOIN loans ON usr_loans.loan_id = loans.id
                LEFT JOIN ast_loans ON loans.id = ast_loans.loan_id
                LEFT JOIN events AS delete_event ON usrs.del_event_id = delete_event.id
                LEFT JOIN events AS add_event ON usrs.add_event_id = add_event.id
                LEFT JOIN events AS loan_event ON loans.loan_event_id = loan_event.id
                LEFT JOIN events AS return_event ON ast_loans.return_event_id = return_event.id
                LEFT JOIN events AS reserve_event ON loans.reserve_event_id = reserve_event.id
                LEFT JOIN events AS cancel_event ON loans.cancel_event_id = cancel_event.id
                LEFT JOIN depts ON usrs.dept_id = depts.id
                WHERE ${isBulkSearch ? bulkCondition : singleCondition}
                GROUP BY 
                    usrs.id, 
                    usrs.user_name, 
                    usrs.bookmarked, 
                    delete_event.event_date,
                    depts.dept_name
            )
            SELECT *
            FROM UserLoanCounts
            ${orderByClause}
            LIMIT 20;
        `;
    
        try {
            const users = await sequelize.query(sql, {
                replacements: { isBulkSearch, searchTerm },
                type: sequelize.QueryTypes.SELECT
            });
    
            const response = users.map(user => {
                // logger.info(user)
                if (this.userIsDeleted(user)) {
                    user.status = 'Deleted';
                } else if (this.userHasNoAsset(user)) {
                    user.status = 'Available';
                } else {
                    user.status = `${user.loanCount} Loaned, ${user.reserveCount} Reserved`;
                }
    
                
                const { name, dept, status, lastEventDate } = user;
                logger.info(status)

                const isDisabled = disabledCondition(user)
            
                return {
                    value: name,
                    label: `${name}`, // Capitalize the first letter
                    userId: user.id,
                    description: `${dept} ${isDisabled ? `(${status})` : ''}`,
                    isDisabled, // Disable if not in validStatuses
                    lastEventDate
                };
            });
    
            return response;
        } catch (error) {
            throw error;
        }
    };

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