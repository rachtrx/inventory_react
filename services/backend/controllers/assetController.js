const { Admin, Asset, AssetType, AssetTypeVariant, Vendor, User, sequelize, Sequelize} = require('../models/postgres');
const { Op } = Sequelize;

const logger = require('../logging');
const mongodb = require('../models/mongo');

const dateTimeObject = {
    weekday: 'short',
    hour: 'numeric' || '',
    minute: 'numeric' || '',
    day: 'numeric',
    month: 'short',
    year: '2-digit'
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
                'addedDate',
                'location',
                'bookmarked',
                'value',
                'deletedDate',
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
                    model: User,
                    attributes: ['id', 'userName', 'bookmarked']
                }
            ],
        })

        const result = query.map(asset => {
            return asset.createAssetObject(getAge=true);
        });

        // logger.info(result.slice(100, 110));
        res.json(result);
    } catch (error) {
        logger.error(error)
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
        throw error;
    }
}

exports.searchAssets = async (req, res) => {
    const { value, formType } = req.body;

    const validMap = {
        [formTypes.DEL_ASSET]: ['Available'],
        [formTypes.LOAN]: ['Available'],
        [formTypes.RETURN]: ['On Loan']
    }

    const validStatuses = validMap[formType];
    if (!validStatuses) {
        return res.status(400).send('Invalid form type provided.');
    }
    try {
        const query = await Asset.findAll({
            attributes: [
                'id',
                'serialNumber',
                'assetTag',
                'bookmarked',
                'deletedDate'
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
                    model: User,
                    attributes: ['id', 'userName', 'bookmarked']
                }
            ],
            where: {
                assetTag: {
                    [Op.like]: `%${value}%`
                }
            }
        }).then(assets => {
            // Calculate age for each asset and include it in the results
            // const plainAsset = asset.get({ plain: true });
            return assets.map(asset => asset.createAssetObject());
        })
        
        // Convert plain objects to model instances if mapToModel was set to false
        const assets = query.map(data => {
    
            logger.info(data);
            const { id, assetTag, serialNumber, status } = data;
            const disabled = !validStatuses.includes(status)
        
            return {
                value: id,
                label: `${assetTag} - ${serialNumber} ${disabled ? `(${status})` : ''}`, // Capitalize the first letter
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

exports.getAsset = async (req, res) => {
    const assetId = req.params.id;
    const { Event } = mongodb;

    try {
        const assetDetailsPromise = Asset.findOne({
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
                    model: User,
                    attributes: ['id', 'userName', 'bookmarked']
                }
            ],
            where: { id: assetId }
        });

        const assetEventsPromise = Event.find({ assetId }).sort({ eventDate: -1 });

        const [assetDetails, assetEvents] = await Promise.all([assetDetailsPromise, assetEventsPromise]);

        if (!assetDetails) return res.status(404).send({ error: "Asset not found" });

        const asset = assetDetails.createAssetObject()

        asset.events = assetEvents;

        logger.info('Details for Asset:', asset);

        res.json(assetDetails);
    } catch (error) {
        logger.error("Error fetching asset details:", error);
        res.status(500).send({ error: "Internal server error" });
    }
};

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