const { Admin, Asset, AssetType, AssetTypeVariant, Vendor, User, Event, sequelize, Sequelize} = require('../models');
const { Op } = Sequelize;

const logger = require('../logging')

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
        bookmarked: asset.bookmarked || 0,
        variant: asset.AssetTypeVariant.variantName,
        assetType: asset.AssetTypeVariant.AssetType.assetType,
        vendor: asset.Vendor.vendorName,
        ...(asset.location && {location: asset.location}),
        ...(asset.Events[0].eventType == 'loaned' && {
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
        const query = await Asset.findAll({
            attributes: [
                'id',
                'serialNumber',
                'assetTag',
                'status',
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
                        [Op.and]: [
                            sequelize.where(sequelize.col('Events.event_date'), Op.eq, sequelize.literal(
                                `(SELECT MAX(event_date) FROM Events AS e WHERE e.asset_id = "Asset"."id")`
                            ))
                        ]
                    },
                    include: {
                        model: User,
                        attributes: ['id', 'userName', 'bookmarked']
                    }
                }
            ],
            where: {
                status: { [Op.ne]: 'condemned' }
            }
        }).then(assets => {
            // Calculate age for each asset and include it in the results
            return assets.map(asset => {
                const plainAsset = asset.get({ plain: true });
                const now = Intl.DateTimeFormat('en-sg', dateTimeObject).format(new Date());
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
                'status',
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
    const assetId = req.params.id;

    try {
        const asset = await Asset.findOne({
            where: { id: assetId },
        });

        if (!asset) {
            res.json({ error: "Asset not found" });
        }

        if (action === "add") {
            asset.bookmarked = 1;
        } else {
            asset.bookmarked = 0;
        }

        await asset.save();

        res.json({ message: "Bookmark updated successfully" });
    } catch (error) {
        res.json({ error: "An error occurred while updating the bookmark" });
    }
};