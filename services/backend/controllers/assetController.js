const { Admin, Asset, AssetType, AssetTypeVariant, Vendor, User, sequelize, Sequelize} = require('../models');
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
    return {
        id: asset.id,
        serialNumber: asset.serialNumber,
        assetTag: asset.assetTag,
        assetType: asset.AssetTypeVariant.AssetType.assetType,
        variant: asset.AssetTypeVariant.variantName,
        bookmarked: asset.bookmarked || 0,
        status: asset.status,
        vendor: asset.Vendor.vendorName,
        modelValue: String(parseFloat(asset.value)) || 'Unspecified', // removed toFixed(2) since database handles it
        ...(asset.location && {location: asset.location}),
        ...(asset.AssetTypeVariant.AssetType.assetType && {deviceType: asset.AssetTypeVariant.AssetType.assetType}),
        ...(asset.registeredDate && {registeredDate: Intl.DateTimeFormat('en-sg', dateTimeObject).format(new Date(asset.registeredDate))}),
        ...(asset.User?.userName && {userName: asset.User.userName}),
        ...(asset.User?.id && {userId: asset.User.id}),
        ...((asset.User?.bookmarked && {userBookmarked: asset.User.bookmarked}) || (asset.User && {userBookmarked: 0})),
        ...(asset.age && {age: asset.age}),
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
                'value'
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
                    model:Vendor,
                    attributes:['vendorName']
                },
                {
                    model: User,
                    required: false,
                    attributes: ['id', 'userName', 'bookmarked']
                }
            ],
            where: {
                status: { [Op.ne]: 'condemned' }
            }
        }).then(assets => {
            // Calculate age for each asset and include it in the results
            return assets.map(asset => {
                const plainAsset = asset.get({ plain: true });
                const now = new Date();
                const created = new Date(asset.registeredDate);
                const age = Math.floor((now - created) / (365.25 * 24 * 60 * 60 * 1000));
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
        const details = await Asset.findOne({
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
                    attributes: ['variantName']
                },
                {
                    model: AssetType,
                    attributes: ['assetType']
                },
                {
                    model: Vendor,
                    attributes: ['vendorName']
                },
                {
                    model: User,
                    attributes: ['id', 'userName, bookmarked'],
                    required: false
                }
            ],
            where: {
                id: assetId
            }
        });

        // Fetch all events related to the asset
        const events = await Event.findAll({
            attributes: [
                ['id', 'eventId'],
                'eventType',
                'eventDate',
                'remarks',
                'filepath',
                // [sequelize.col('User.id'), 'userId'],
                // [sequelize.col('User.userName'), 'userName'],
                // [sequelize.col('User.bookmarked'), 'userBookmarked']
            ],
            include: [
                {
                    model: User,
                    attributes: ['id', 'userName', 'bookmarked']
                }
            ],
            where: {
                asset_id: assetId
            },
            order: [['eventDate', 'DESC']]
        });

        // Extract past users from the returned events
        const pastUsers = events
            .filter(event => event.eventType === 'returned')
            .map(event => ({
                id: event.userId,
                user_name: event.userName,
                bookmarked: event.userBookmarked
            }));

        res.json({ details, events, pastUsers });
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