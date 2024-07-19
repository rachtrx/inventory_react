const { Admin, Asset, AssetType, AssetTypeVariant, Vendor, User, Event, sequelize, Sequelize} = require('../models');
const { Op } = Sequelize;

const logger = require('../logging');
const { getLatestEventIds } = require('./utils');

const dateTimeObject = {
    weekday: 'short',
    hour: 'numeric' || '',
    minute: 'numeric' || '',
    day: 'numeric',
    month: 'short',
    year: '2-digit'
}

const createAssetObject = function(asset) {
    const pastUsers = asset.Events
        .filter(event => event.eventType === 'returned')  // Filter to get only 'returned' events
        .map(event => {
            // Map each filtered event to an object containing the user details
            return {
            id: event.User.id,
            name: event.User.userName,
            bookmarked: event.User.bookmarked
            };
        });

    return {
        id: asset.id,
        serialNumber: asset.serialNumber,
        assetTag: asset.assetTag,
        status: asset.Events[0].eventType,
        value: String(parseFloat(asset.value)) || 'Unspecified', // removed toFixed(2) since database handles it
        bookmarked: asset.bookmarked && true || false,
        variant: asset.AssetTypeVariant.variantName,
        assetType: asset.AssetTypeVariant.AssetType.assetType,
        vendor: asset.Vendor.vendorName,
        ...(asset.location && {location: asset.location}),
        ...(asset.Events[0].eventType === 'loaned' && {
            user: {
                id: asset.Events[0].User.id,
                name: asset.Events[0].User.userName,
                bookmarked: asset.Events[0].User.bookmarked
            }
        }),
        // For ALL Assets
        ...(asset.age && {age: asset.age}),

        // For SINGLE Asset
        ...(pastUsers.length > 0 && { pastUsers }),
        ...(asset.Events.length > 0 && {events: asset.Events}),
    }
}

exports.getAssets = async (req, res) => { // TODO Add filters

    const assetsExist = await Asset.count();
    if (assetsExist === 0) {
        return res.json([]);
    }

    try {
        const latestEventIds = await getLatestEventIds();

        const query = await Asset.findAll({
            attributes: [
                'id',
                'serialNumber',
                'assetTag',
                'registeredDate',
                'location',
                'bookmarked',
                'value',
            ],
            include: [
                {
                    model: AssetTypeVariant,
                    attributes:['variantName'],
                    include: {
                        model: AssetType,
                        attributes: ['assetType']
                    }
                },
                {
                    model: Vendor,
                    attributes:['vendorName']
                },
                {
                    model: Event,
                    attributes: ['eventDate', 'eventType'],  // You might want to fetch specific fields from Event
                    required: false,
                    where: {
                        id: { [Op.in]: latestEventIds }
                    },
                    include: {
                        model: User,
                        attributes: ['id', 'userName', 'bookmarked']
                    }
                }
            ],
        }).then(assets => {
            // Calculate age for each asset and include it in the results
            return assets.map(asset => {
                const plainAsset = asset.get({ plain: true });
                const now = new Date()
                const created = new Date(asset.registeredDate); // Convert registeredDate string to Date object
                const age = Math.floor((now - created) / (365.25 * 24 * 60 * 60 * 1000));
                // const nowSG = new Intl.DateTimeFormat('en-SG', dateTimeOptions).format(nowUTC); // IMPT JUST FYI
                return { ...plainAsset, age };
            });
        })
        logger.info(query.slice(100, 110));
        const assets = query.map(asset => createAssetObject(asset));
        logger.info(assets.slice(100, 110));
        res.json(assets);
    } catch (error) {
        logger.error(error)
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
        throw error;
    }
}

exports.searchAssets = async (req, res) => {
    const { value, formType } = req.body;

    validMap = {
        'loanAsset': ['returned', 'registered'],
        'returnAsset': ['loaned'],
        'condemnAsset': ['returned', 'registered']
    }

    const validStatuses = validMap[formType];
    if (!validStatuses) {
        return res.status(400).send('Invalid form type provided.');
    }

    try {
        // Map the validStatuses array to create a safe list of strings for SQL IN condition
        const statusConditions = validStatuses.map(status => `'${status.replace(/'/g, "''")}'`).join(', ');

        const query = `
            SELECT assets.asset_tag, assets.serial_number, asset_type_variants.variant_name, events.event_date, events.event_type, 
            CASE WHEN events.event_type IN (${statusConditions}) THEN 1 ELSE 0 END AS order_status
            FROM assets
            JOIN asset_type_variants ON assets.variant_id = asset_type_variants.id
            LEFT JOIN events ON events.asset_id = assets.id AND events.event_date = (
                SELECT MAX(event_date) FROM events AS e WHERE e.asset_id = assets.id
            )
            WHERE assets.asset_tag ILIKE :assetTag
            ORDER BY order_status DESC, events.event_date, assets.id
            LIMIT 20;
        `;

        const results = await sequelize.query(query, {
            replacements: { assetTag: `%${value}%` },
            type: sequelize.QueryTypes.SELECT
        });
    
        const assets = results.map(asset => {
            logger.info(asset);
            const eventType = asset.event_type; // Directly access the property
            const disabled = !validStatuses.includes(eventType)
        
            return {
                value: asset.id,
                label: `${asset.asset_tag} - ${asset.serial_number} ${disabled ? `(${asset.event_type})` : ''}`, // Capitalize the first letter
                isDisabled: disabled // Disable if not in validStatuses
            };
        });

        res.json(assets);
    } catch (error) {
        logger.error('Error fetching assets:', error)
        console.error('Error fetching assets:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.showAsset = async (req, res) => { // TODO Promise.all?
    try {
        const assetId = req.params.id;
        // Fetching asset details
        const query = await Asset.findOne({
            attributes: [
                'id',
                'serialNumber',
                'assetTag',
                'location',
                'value',
                'bookmarked',
            ],
            include: [
                {
                    model: AssetTypeVariant,
                    attributes: ['variantName'],
                    include: {
                        model: AssetType,
                        attributes: ['assetType']
                    }
                },
                {
                    model: Vendor,
                    attributes: ['vendorName']
                },
                {
                    model: Event,
                    attributes: ['id', 'eventType', 'eventDate', 'remarks', 'filepath'],
                    include: { 
                        model: User, 
                        attributes: ['id', 'userName', 'bookmarked'] 
                    },
                    order: [['eventDate', 'DESC']]
                }
            ],
            where: {
                id: assetId
            }
        })

        if (!query) return res.error()

        const details = query.get({ plain: true });

        logger.info(createAssetObject(details));

        res.json(createAssetObject(details));
    } catch (error) {
        console.error("Error fetching device details:", error);
        throw error;
    }
}

exports.bookmarkAsset = async (req, res) => {
    const { id, bookmarked } = req.body;

    try {
        const asset = await Asset.findByPk(id);

        if (asset) {
            asset.bookmarked = bookmarked === true ? 1 : 0;
            await asset.save();
            res.json({ message: "Bookmark updated successfully" });
        } else {
            res.status(404).json({ message: "Asset not found" });
        }
    } catch (error) {
        res.json({ error: "An error occurred while updating the bookmark" });
    }
};