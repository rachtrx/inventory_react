const { sequelize, Sequelize, Vendor, Dept, User, AssetType, AssetTypeVariant, Asset, Event } = require('../models');

const logger = require('../logging')

function processAssets(events) {
    let returned = [];
    let onLoan = [];

    if (events) {
        events.forEach(event => {
            if (!event.asset) return;  // Skip events without an associated asset
    
            const asset = {
                id: event.asset.id,
                assetTag: event.asset.assetTag,
                serialNumber: event.asset.serialNumber,
                bookmarked: event.asset.bookmarked,
                ...(event.asset.variant && {variant: event.asset.variant}),
                ...(event.asset.assetType && {assetType: event.asset.assetType})
            };
    
            if (event.eventType === 'loaned') {
                // Only add or update if there isn't an existing 'returned' entry
                if (!returned.some(a => a.id === asset.id) && !onLoan.some(a => a.id === asset.id)) {
                    onLoan.push(asset)
                } else return;
    
            if (event.eventType === 'returned') {
                returned.push(asset); // Add or update returned list
            }
            }
        });
    }
    return { returned, onLoan };
}

const createUserObject = function(user) {

    return {
        id: user.id,
        name: user.userName,
        bookmarked: user.bookmarked || 0,
        hasResigned: user.has_resigned || 0,
        registeredDate: user.registeredDate,
        department: user.Dept.deptName,
        events: user.Events?.map(event => ({
            id: event.id,
            eventType: event.eventType,
            eventDate: event.eventDate,
            asset: event.Asset ? {
                id: event.Asset.id,
                assetTag: event.Asset.assetTag,
                serialNumber: event.Asset.serialNumber,
                bookmarked: event.Asset.bookmarked,
                variant: event.Asset.AssetTypeVariant?.variantName,
                assetType: event.Asset.AssetTypeVariant?.AssetType?.assetType,
            } : undefined
        }))
    }
}

exports.getUsers = async (req, res) => {
    try {
        const usersExist = await User.count();
        
        if (usersExist === 0) {
            return res.json([]);
        }

        // GET ALL THE DEVICES ON LOAN
        const subquery = sequelize.literal(`(
            SELECT e.asset_id
            FROM Events e
            INNER JOIN (
                SELECT asset_id, MAX(event_date) as max_date
                FROM events
                GROUP BY asset_id
            ) maxEvents ON e.asset_id = maxEvents.asset_id AND e.event_date = maxEvents.max_date
            WHERE e.event_type = 'loaned'
        )`);

        const query = await User.findAll({
            include: [{
                model: Event,
                attributes: ['eventDate', 'eventType'],  // You might want to fetch specific fields from Event
                required: false,
                order: [['eventDate', 'DESC']],
                include: {
                    model: Asset,
                    required: true,
                    attributes: ['id', 'assetTag', 'serialNumber', 'bookmarked'],
                    where: {
                        id: { [Sequelize.Op.in]: subquery }
                    },
                    include: {
                        model: AssetTypeVariant,
                        attributes: ['variantName']
                    }
                }
            }, 
            {
                model: Dept,
                required: true,
                attributes: ['deptName']
            }],
            // TODO
            // where: {
            //     hasResigned: { [Sequelize.Op.ne]: 1 }
            // },
            order: [['registeredDate', 'DESC']],
            attributes: ['id', 'userName', 'bookmarked', 'hasResigned', 'registeredDate']
        });
        
        // Mapping over the result to modify each user object
        const result = query.map(user => {
            let plainUser = user.get({ plain: true });

            plainUser = createUserObject(plainUser);
            plainUser.assets = plainUser.events
            .map(event => ({
                id: event.asset.id,
                assetTag: event.asset.assetTag,
                serialNumber: event.asset.serialNumber,
                bookmarked: event.asset.bookmarked,
                variant: event.asset.variant,
                assetType: event.asset.assetType
            }));
            plainUser.assetCount = plainUser.assets.length
            delete plainUser.events;

            return plainUser;
        });

        logger.info(query.map(user => user.get({ plain: true })).slice(10, 20));
        logger.info(result.slice(10, 20));
        res.json(result);
    } catch (error) {
        console.error('Error fetching user views:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.showUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const query = await User.findByPk(userId, {
            include: [{
                model: Dept,
                attributes: ['deptName']
            },
            {
                model: Event,
                attributes: ['id', 'eventType', 'eventDate', 'remarks', 'filepath'],
                include: { 
                    model: Asset, 
                    attributes: ['id', 'assetTag', 'serialNumber', 'bookmarked'] ,
                    include: [{
                        model: AssetTypeVariant,
                        attributes: ['variantName'],
                        include: [{
                            model: AssetType,
                            attributes: ['assetType']
                        }],
                    }],
                },
                where: {
                    eventType: { [Sequelize.Op.in]: ['loaned', 'returned'] }
                },
                order: [['eventDate', 'DESC']]
            }],
            attributes: ['id', 'userName', 'bookmarked', 'hasResigned']
        });

        if (!query) return res.error()

        const user = createUserObject(query.get({ plain: true }));
        const { returned: pastAssets, onLoan: currentAssets } = processAssets(user.events)
        res.json({ ...user, pastAssets, currentAssets })

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
};


exports.bookmarkUser = async (req, res) => {
    const { userId, action } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (user) {
            user.bookmarked = action === 'add' ? 1 : 0;
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

