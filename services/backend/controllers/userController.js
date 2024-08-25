const { sequelize, Sequelize, Loan, Department, User, AssetType, AssetTypeVariant, Asset, AssetLoan, LoanDetail, Peripheral, PeripheralType } = require('../models/postgres');
const { Op } = Sequelize;
const mongodb = require('../models/mongo');

const logger = require('../logging');
const { formTypes, createSelection, getAllOptions, getDistinctOptions } = require('./utils')

exports.getFilters = async (req, res) => {
    const { field } = req.body;

    let options;
    try {
        if (field === 'department') {
            meta = [Department, 'id', 'deptName'];
            logger.info(meta)
            options = await getAllOptions(meta)
            
        } else if (field === 'assetCount') {
            const result = await LoanDetail.findAll({
                attributes: [
                    'userId',
                    [Sequelize.fn('COUNT', Sequelize.col('"Loan->Asset"."id"')), 'assetCount']
                ],
                include: {
                    model: Loan,
                    attributes: [],
                    required: true,
                    include: {
                        model: Asset,
                        attributes: [],
                        required: true,
                    }
                },
                where: { status: 'COMPLETED' },
                group: ['"LoanDetail.user_id"'], // TODO
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

exports.getUsers = async (req, res) => {
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
            include: [{
                model: LoanDetail,
                attributes: ['status', 'startDate', 'expectedReturnDate'],
                where: { status: 'COMPLETED' },
                include: {
                    model: Loan,
                    attributes: ['id'],
                    required: false,
                    include: [
                        {
                            model: Asset,
                            attributes: ['id', 'assetTag', 'serialNumber', 'bookmarked'],
                            include: {
                                model: AssetTypeVariant,
                                attributes: ['variantName'],
                                include: {
                                    model: AssetType,
                                    attributes: ['assetType']
                                }
                            }
                        },
                        {
                            model: Peripheral,
                            attributes: ['count'],
                            include: {
                                model: PeripheralType,
                                attributes: ['id', 'peripheralName'],
                            }
                        }
                    ]
                }
            },
            {
                model: Department,
                required: true,
                attributes: ['deptName'],
                ...(filters.department.length > 0 && { where: { id: { [Op.in]: filters.department } } }),
            }],
            where: whereClause,
            // TODO
            order: [['addedDate', 'DESC']],
            attributes: ['id', 'userName', 'bookmarked', 'addedDate']
        });

        if (filters.assetCount.length > 0) {
            filters.assetCount = filters.assetCount.map(count => parseInt(count, 10));
            query = query.filter(user => {
                return filters.assetCount.includes(user.Loans.length);
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

exports.getUser = async (req, res) => {
    const userId = req.params.id;
    const { Event } = mongodb;

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

exports.searchUsers = async (req, res) => {
    const { value, formType } = req.body;

    let orderByClause;

    if (formType === 'LOAN') {
        orderByClause = `
            ORDER BY 
                "deletedDate" IS NOT NULL ASC,
                "updatedAt" DESC
        `;
    } else if (formType === 'DEL_USER') {
        orderByClause = `
            ORDER BY 
                "deletedDate" IS NOT NULL ASC,
                ("reserveCount" = 0 AND "loanCount" = 0) ASC,
                "reserveCount" = 0 ASC,
                "loanCount" = 0 ASC,
                "updatedAt" DESC
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
                users.deleted_date AS "deletedDate", 
                departments.dept_name AS department,
                CAST(COUNT(CASE WHEN loan_details.status = 'COMPLETED' AND assets.id IS NOT NULL THEN 1 END) AS INTEGER) AS "loanCount",
                CAST(COUNT(CASE WHEN loan_details.status = 'RESERVED' AND assets.id IS NOT NULL THEN 1 END) AS INTEGER) AS "reserveCount",
                users.updated_at AS "updatedAt"
            FROM users
            LEFT JOIN loan_details ON users.id = loan_details.user_id
            LEFT JOIN loans ON loan_details.loan_id = loans.id
            LEFT JOIN assets ON loans.id = assets.loan_id
            LEFT JOIN departments ON users.dept_id = departments.id
            WHERE users.user_name ILIKE :userName
            GROUP BY users.id, departments.dept_name
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

        response = users.map(user => {
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
                label: `${name} - ${department} ${disabled ? `(${status})` : ''}`, // Capitalize the first letter
                name: name,
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

exports.bookmarkUser = async (req, res) => {
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

