const { Admin, Asset, AssetType, AssetTypeVariant, Vendor, User } = require('../models');
const { Op } = require('sequelize');

exports.getFilters = async (req, res) => {
    try {

        const [deviceTypes, modelNames, vendors, locations, ages] = await Promise.all([
            AssetType.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('assetType')), 'assetType']],
                raw: true
            }),
            AssetTypeVariant.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('variantName')), 'variantName']],
                raw: true
            }),
            Vendor.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('vendorName')), 'vendorName']],
                raw: true
            }),
            Asset.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('location')), 'location']],
                raw: true
            }),
            Asset.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('age')), 'age']],
                raw: true
            })
        ]);
        
        const filters = {
            assetTypes: deviceTypes.map(type => type.assetType),
            AssetTypeVariants: modelNames.map(model => model.variantName),
            vendors: vendors.map(vendor => vendor.vendorName),
            locations: locations.map(location => location.location),
            ages: ages.map(age => age.age)
        };

        res.json(filters);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
        throw error;
    }
}

exports.getAssets = async (req, res) => { // TODO Add filters

    try {
        const query = await Asset.findAll({
            attributes: [
                'id',
                'serialNumber',
                'assetTag',
                'status',
                'registeredDate',
                'location',
                'age',
                'bookmarked',
            ],
            include: [
                {
                    model:AssetTypeVariant,
                    attributes:['variantName']
                },
                {
                    model:Vendor,
                    attributes:['vendorName']
                },
                {
                    model: AssetType,
                    attributes:['assetType']
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
        });
        res.json(query);
    } catch (error) {
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