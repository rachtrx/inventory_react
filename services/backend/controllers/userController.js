const { sequelize, Sequelize, Event, Dept, Usr, AstType, AstSType, Ast, AstLoan, UsrLoan, AccLoan, AccType } = require('../models/postgres');
const { Op } = require('sequelize');
const logger = require('../logging.js');
const { formTypes, createSelection, getAllOptions, getDistinctOptions } = require('./utils.js');

class UserController {

    async getFilters (req, res) {
        const { field } = req.body;
    
        let options;
        try {
            if (field === 'deptName') {
                const meta = [Dept, 'id', 'deptName'];
                logger.info(meta)
                options = await getAllOptions(meta)
                
            } else if (field === 'assetCount') {
                const result = await AstLoan.findAll({
                    attributes: [
                        Sequelize.col('"UsrLoan.user_id"'), // TODO
                        [Sequelize.fn('COUNT', Sequelize.col('"AstLoan"."id"')), 'assetCount']
                    ],
                    include: {
                        model: Loan,
                        attributes: [],
                        where: { returnEventId: null },
                        include: {
                            model: UsrLoan,
                            attributes: ['userId'],
                            include: {
                                model: Usr,
                                attributes: [],
                            },
                        }
                    },
                    group: ['"Loan->UsrLoan.user_id"'], // TODO
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
                            attributes: ['id', 'reserveEventId', 'cancelEventId', 'expectedReturnDate', 'loanEventId'],
                            include: [
                                {
                                    model: AstLoan,
                                    attributes: ['id', 'returnEventId'],
                                    include: [
                                        {
                                            model: Ast,
                                            attributes: ['id', 'assetTag', 'serialNumber', 'bookmarked'],
                                            include: {
                                                model: AstSType,
                                                attributes: ['id', 'subTypeName'],
                                                include: {
                                                    model: AstType,
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
                                    attributes: ['id', 'returnEventId'],
                                    include: {
                                        model: AccType,
                                        attributes: ['id', 'accessoryName'],
                                    },
                                    where: {
                                        returnEventId: {
                                            [Op.is]: null
                                        }
                                    },
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
                where: whereClause,
                // TODO
                // order: [['addedDate', 'DESC']],
            });
    
            if (filters.assetCount.length > 0) {
                filters.assetCount = filters.assetCount.map(count => parseInt(count, 10));
                query = query.filter(user => {
                    return filters.assetCount.includes(user.AstLoans.length);
                });
            }
            
            // Mapping over the result to modify each user object
            const result = query.map(user => {
                return user.createUserObject();
            });
    
            // logger.info(result.slice(10, 20));
            res.json(result);
        } catch (error) {
            console.error('Error fetching user views:', error);
            res.status(500).send('Internal Server Error');
        }
    };
    
    async getUser (req, res) {
        const userId = req.params.id;
    
        try {
            const userDetailsPromise = Usr.findByPk(userId, {
                include: [
                    {
                        model: Dept,
                        attributes: ['deptName']
                    },
                    {
                        model: Event,
                        as: 'AddEvent',
                        attributes: ['eventDate']
                    },
                    {
                        model: Event,
                        as: 'DeleteEvent',
                        attributes: ['eventDate'],
                        required: false,
                    },
                    {
                        model: UsrLoan,
                        attributes: ['id', 'filepath'],
                        include: {
                            model: Loan,
                            attributes: ['id', 'expectedReturnDate'],
                            include: [
                                {
                                    model: AstLoan,
                                    include: [
                                        {
                                            model: Ast,
                                            attributes: ['id', 'assetTag', 'bookmarked'],
                                            include: {
                                                model: AstSType,
                                                attributes: ['subTypeName']
                                            }
                                        },
                                        {
                                            model: Event,
                                            as: 'ReturnEvent',
                                            attributes: ['eventDate'],
                                            required: false
                                        }
                                    ]
                                },
                                {
                                    model: Event,
                                    as: 'ReserveEvent',
                                    attributes: ['eventDate'],
                                    required: false
                                },
                                {
                                    model: Event,
                                    as: 'CancelEvent',
                                    attributes: ['eventDate'],
                                    required: false
                                },
                                {
                                    model: Event,
                                    as: 'LoanEvent',
                                    attributes: ['eventDate'],
                                    required: false,
                                },
                            ]
                        }
                    }
                ],
                attributes: ['id', 'userName', 'bookmarked']
            });
    
            const userEventsPromise = Event.find({ userId }).sort({ eventDate: -1 });
    
            const [userDetails, userEvents] = await Promise.all([userDetailsPromise, userEventsPromise]);
    
            if (!userDetails) return res.status(404).send({ error: "Usr not found" });
    
            // Attach events to the user details
    
            const user = userDetails.createUserObject()
    
            user.events = userEvents;
    
            logger.info('Details for Usr:', user);
    
            res.json(user);
        } catch (error) {
            logger.error("Error fetching user details:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    };
    
    async searchUsers (req, res) {
        const { value, formType } = req.body;

        const isBulkSearch = Array.isArray(value) ? true : false;
        const searchTerm = isBulkSearch ? value : `%${value}%`;
    
        let orderByClause;
    
        if (formType === 'LOAN') {
            orderByClause = `
                ORDER BY
                    "deletedDate" IS NOT NULL ASC,
                    "lastEventDate" DESC
            `;
        } else if (formType === 'DEL_USER') {
            orderByClause = `
                ORDER BY 
                    "deletedDate" IS NOT NULL ASC,
                    ("reserveCount" = 0 AND "loanCount" = 0) DESC,
                    "reserveCount" = 0 DESC,
                    "loanCount" = 0 DESC,
                    "lastEventDate" DESC
            `;
        } else {
            throw new Error('Invalid form type provided.');
        }

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
                if (user.deletedDate) {
                    user.status = 'Deleted';
                } else if (user.loanCount === 0 && user.reserveCount === 0) {
                    user.status = 'Available';
                } else {
                    user.status = `${user.loanCount} Loaned, ${user.reserveCount} Reserved`;
                }
    
                
                const { name, dept, status } = user;
                logger.info(status)
                let disabled;
                switch(formType) {
                    case formTypes.LOAN:
                        disabled = status === 'Deleted'
                        break;
                    case formTypes.DEL_USER:
                        disabled = status !== 'Available'
                        break;
                }
            
                return {
                    value: user.id,
                    label: `${name}`, // Capitalize the first letter
                    description: `${dept} ${disabled ? `(${status})` : ''}`,
                    userName: name,
                    isDisabled: disabled // Disable if not in validStatuses
                };
            });
    
            res.json(response)
        } catch (error) {
            logger.error('Error fetching users:', error)
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    async updateUser(req, res) {
        const { id, field, newValue } = req.body;
    
        try {
            const user = await Usr.findByPk(id);
    
            if (user) {
                user[field] = newValue,
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