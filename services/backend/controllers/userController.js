const { sequelize, Sequelize, Event, Department, User, AssetType, AssetTypeVariant, Asset, AssetLoan, UserLoan, GroupLoan, PeripheralLoan, PeripheralType, Peripheral, TaggedPeripheralLoan, UntaggedPeripheralLoan } = require('../models/postgres');
const { Op } = require('sequelize');
const logger = require('../logging.js');
const { formTypes, createSelection, getAllOptions, getDistinctOptions } = require('./utils.js');

class UserController {

    async getFilters (req, res) {
        const { field } = req.body;
    
        let options;
        try {
            if (field === 'department') {
                const meta = [Department, 'id', 'deptName'];
                logger.info(meta)
                options = await getAllOptions(meta)
                
            } else if (field === 'assetCount') {
                const result = await AssetLoan.findAll({
                    attributes: [
                        Sequelize.col('"UserLoan.user_id"'),
                        [Sequelize.fn('COUNT', Sequelize.col('"AssetLoan"."id"')), 'assetCount']
                    ],
                    include: {
                        model: UserLoan,
                        attributes: [],
                        required: true,
                        include: {
                            model: User,
                            attributes: [],
                            required: true,
                        }
                    },
                    where: { returnEventId: null },
                    group: ['"UserLoan.user_id"'], // TODO
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
    
            const usersExist = await User.count();
            
            if (usersExist === 0) {
                return res.json([]);
            }
    
            const whereClause = {
                ...(filters.name && { userName: { [Op.iLike]: filters.name } }),
            };
    
            let query = await User.findAll({
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
                        model: UserLoan,
                        required: false,
                        attributes: ['id', 'reserveEventId', 'cancelEventId', 'expectedReturnDate', 'loanEventId'],
                        include: [
                            {
                                model: AssetLoan,
                                attributes: ['id', 'returnEventId'],
                                include: [
                                    {
                                        model: Asset,
                                        attributes: ['id', 'assetTag', 'serialNumber', 'bookmarked'],
                                        include: {
                                            model: AssetTypeVariant,
                                            attributes: ['id', 'variantName'],
                                            include: {
                                                model: AssetType,
                                                attributes: ['id', 'assetType']
                                            }
                                        }
                                    },
                                    {
                                        model: TaggedPeripheralLoan,
                                        attributes: ['id', 'returnEventId'],
                                        required: false,
                                        include: {
                                            model: Peripheral,
                                            attributes: ['id'],
                                            include: {
                                                model: PeripheralType,
                                                attributes: ['id', 'peripheralName'],
                                            },
                                            required: false,
                                        },
                                        where: {
                                            returnEventId: {
                                                [Op.is]: null
                                            }
                                        },
                                    }
                                ],
                                where: {
                                    returnEventId: {
                                        [Op.is]: null
                                    }
                                },
                            },
                            {
                                model: UntaggedPeripheralLoan,
                                attributes: ['id', 'returnEventId'],
                                required: false,
                                include: {
                                    model: Peripheral,
                                    attributes: ['id'],
                                    include: {
                                        model: PeripheralType,
                                        attributes: ['id', 'peripheralName'],
                                    },
                                },
                                where: {
                                    returnEventId: {
                                        [Op.is]: null
                                    }
                                },
                            }
                        ],
                    },
                    {
                        model: Department,
                        required: true,
                        attributes: ['deptName'],
                        ...(filters.department.length > 0 && { where: { id: { [Op.in]: filters.department } } }),
                    }
                ],
                where: whereClause,
                // TODO
                // order: [['addedDate', 'DESC']],
            });
    
            if (filters.assetCount.length > 0) {
                filters.assetCount = filters.assetCount.map(count => parseInt(count, 10));
                query = query.filter(user => {
                    return filters.assetCount.includes(user.AssetLoans.length);
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
            const userDetailsPromise = User.findByPk(userId, {
                include: [{
                    model: Department,
                    attributes: ['deptName']
                },
                {
                    model: LoanDetail,
                    attributes: ['status', 'startDate', 'expectedReturnDate'],
                    include: {
                        model: Loan,
                        attributes: ['id'],
                        include: {
                            model: Asset,
                            attributes: ['id', 'assetTag', 'bookmarked'],
                            include: {
                                model: AssetTypeVariant,
                                attributes: ['variantName']
                            }
                        },
                    }
                }],
                attributes: ['id', 'userName', 'bookmarked', 'addedDate', 'deletedDate']
            });
    
            const userEventsPromise = Event.find({ userId }).sort({ eventDate: -1 });
    
            const [userDetails, userEvents] = await Promise.all([userDetailsPromise, userEventsPromise]);
    
            if (!userDetails) return res.status(404).send({ error: "User not found" });
    
            // Attach events to the user details
    
            const user = userDetails.createUserObject()
    
            user.events = userEvents;
    
            logger.info('Details for User:', user);
    
            res.json(user);
        } catch (error) {
            logger.error("Error fetching user details:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    };
    
    async searchUsers (req, res) {
        const { value, formType } = req.body;
    
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
        
        const sql = `
            WITH UserLoanCounts AS (
                SELECT 
                    users.id, 
                    users.user_name AS name, 
                    users.bookmarked, 
                    delete_event.event_date AS "deletedDate",
                    departments.dept_name AS department,
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
                FROM users
                LEFT JOIN user_loans ON users.id = user_loans.user_id
                LEFT JOIN asset_loans ON asset_loans.id = asset_loans.user_loan_id
                LEFT JOIN events AS delete_event ON users.delete_event_id = delete_event.id
                LEFT JOIN events AS add_event ON users.add_event_id = add_event.id
                LEFT JOIN events AS loan_event ON user_loans.loan_event_id = loan_event.id
                LEFT JOIN events AS return_event ON asset_loans.return_event_id = return_event.id
                LEFT JOIN events AS reserve_event ON user_loans.reserve_event_id = reserve_event.id
                LEFT JOIN events AS cancel_event ON user_loans.cancel_event_id = cancel_event.id
                LEFT JOIN departments ON users.dept_id = departments.id
                WHERE users.user_name ILIKE :userName
                GROUP BY 
                    users.id, 
                    users.user_name, 
                    users.bookmarked, 
                    delete_event.event_date,
                    departments.dept_name
            )
            SELECT *
            FROM UserLoanCounts
            ${orderByClause}
            LIMIT 20;
        `;
    
        try {
            const users = await sequelize.query(sql, {
                replacements: { userName: `%${value}%` },
                type: sequelize.QueryTypes.SELECT
            });
    
            const response = users.map(user => {
                logger.info(user)
                if (user.deletedDate) {
                    user.status = 'Deleted';
                } else if (user.loanCount === 0 && user.reserveCount === 0) {
                    user.status = 'Available';
                } else {
                    user.status = `${user.loanCount} Loaned, ${user.reserveCount} Reserved`;
                }
    
                
                const { name, department, status } = user;
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
                    description: `${department} ${disabled ? `(${status})` : ''}`,
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
    
    async bookmarkUser (req, res) {
        const { id, bookmarked } = req.body;
        try {
            const user = await User.findByPk(id);
            if (user) {
                user.bookmarked = bookmarked === true ? 1 : 0;
                await user.save();
                res.json({ message: "Bookmark updated successfully" });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).send('Internal Server Error');
        }
    };

}    

module.exports = new UserController();