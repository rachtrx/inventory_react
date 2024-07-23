const { sequelize, Sequelize, Vendor, Dept, User, AssetType, AssetTypeVariant, Asset } = require('../models/postgres');
const { Op } = Sequelize;
const mongodb = require('../models/mongo');

const logger = require('../logging');
const { formTypes } = require('./utils');

exports.getUsers = async (req, res) => {
    try {
        const usersExist = await User.count();
        
        if (usersExist === 0) {
            return res.json([]);
        }

        const query = await User.findAll({
            include: [{
                model: Asset,
                required: false,
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
                model: Dept,
                required: true,
                attributes: ['deptName']
            }],
            // TODO
            order: [['addedDate', 'DESC']],
            attributes: ['id', 'userName', 'bookmarked', 'addedDate']
        });
        
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
                model: Dept,
                attributes: ['deptName']
            },
            {
                model: Asset,
                attributes: ['id', 'assetTag', 'bookmarked'],
                include: {
                    model: AssetTypeVariant,
                    attributes: ['variantName']
                },
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
    
    let orderConditions;
    switch (formType) {
        case formTypes.LOAN:
            // For loan, order by User association being null, then by recent updates
            orderConditions = [
                [Sequelize.literal('"User"."deleted_date" IS NOT NULL'), 'ASC'],
                [Sequelize.literal('"User"."updated_at"'), 'DESC'],
            ];
            break;
            case formTypes.DEL_USER:
                // For return, order by User association being not null, then by recent updates
            orderConditions = [
                [Sequelize.literal('"User"."deleted_date" IS NOT NULL'), 'ASC'],
                [sequelize.literal('"Assets.assetCount"'), 'ASC'],
                [Sequelize.literal('"User"."updated_at"'), 'DESC'],
            ];
            break;
        default:
            return res.status(400).send('Invalid form type provided.');
    }

    try {
        const query = await User.findAll({
            attributes: [
                'id',
                'userName',
                'bookmarked',
                sequelize.col('User.deleted_date'),
                sequelize.col('User.updated_at')
            ],
            include: [
                {
                    model: Asset,
                    attributes: [[sequelize.fn('COUNT', sequelize.col('Assets.id')), 'assetCount']],
                    duplicating: false // TODO reuqired?
                },
                {
                    model: Dept,
                    attributes: ['deptName'],
                    duplicating: false // TODO reuqired?
                },
            ],
            where: {
                userName: {
                    [Op.iLike]: `%${value}%`
                }
            },
            group: ['User.id', 'Assets.id', 'Dept.id'],
            order: orderConditions,
            limit: 20
        }).then(users => {
            // Calculate age for each asset and include it in the results
            // const plainAsset = asset.get({ plain: true });
            return users.map(user => user.createUserObject());
        })
    
        const users = query.map(user => {
            logger.info(user);
            const { name, department, status } = user;
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
                isDisabled: disabled // Disable if not in validStatuses
            };
        });

        res.json(users);
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

