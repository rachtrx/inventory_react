const { Asset, AssetType, AssetTypeVariant, Vendor } = require('../models/postgres');
const { Op } = require('sequelize');
const FormHelpers = require('./formHelperController.js');
const { eventTypes } = require('./utils.js');
const { nanoid } = require('nanoid');

class FormAssetController {

    async getAssetTypes (req, res) {
        const assetTypes = await AssetType.findAll({
            where: { id: { [Op.not]: null } },
            order: [['assetType', 'ASC']],
            attributes: ['assetType']
        });
    
        return res.json(assetTypes.map(a => a.assetType));
    };
    
    async getAssetTypeVariants (req, res) {
        console.log(`User ID: ${req.session.userId}`);
        try {
            const vendors = await Vendor.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('vendorName')), 'vendorName']],
                order: [['vendorName', 'ASC']]
            });
            return res.json(vendors.map(v => v.vendorName));
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
    
    async add (req, res) {
        const { assetType, isNewAssetType, variants } = req.body;
    
        try {
            await sequelize.transaction(async (t) => {
                let assetTypeId;
    
                if (isNewAssetType) {
                    const existingAssetType = await AssetType.findOne({
                        where: { assetType: { [Op.iLike]: assetType } },
                        transaction: t
                    });
    
                    if (existingAssetType) {
                        throw new Error(`Device Type ${assetType} already exists!`);
                    }
    
                    assetTypeId = nanoid();
                    await AssetType.create({
                        id: assetTypeId,
                        assetType: assetType
                    }, { transaction: t });
                } else {
                    const existingAssetType = await AssetType.findOne({
                        where: { assetType: { [Op.iLike]: assetType } },
                        attributes: ['id'],
                        transaction: t
                    });
    
                    if (!existingAssetType) {
                        throw new Error(`Device Type ${assetType} not found!`);
                    }
    
                    assetTypeId = existingAssetType.id;
                }
    
                // Check if variant exists with case-insensitive search
                const existingVariant = await AssetTypeVariant.findOne({
                    where: {
                        variantName: { [Op.iLike]: variants.variantName },
                        assetTypeId: assetTypeId
                    },
                    transaction: t
                });
    
                if (existingVariant) {
                    throw new Error(`AssetTypeVariant ${variants.variantName} already exists!`);
                }
    
                // Create the variant
                await AssetTypeVariant.create({
                    id: nanoid(),
                    assetTypeId: assetTypeId,
                    variantName: variants.variantName
                }, { transaction: t });
            });
    
            console.log("Asset and its variant created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset creation:", error);
            return res.status(400).json({ error: error.message });
        }
    };
    
    async register (req, res) {
        const data = req.body;
        const variantId = data.variantId; // TODO CONVERT TO DICT
        const vendorName = data.vendorName; // TODO CONVERT TO DICT
        const value = parseFloat(data.value).toFixed(2); // TODO CONVERT TO DICT
        const assets = data.assets; // TODO CONVERT TO DICT
        const isNewVendor = data.isNewVendor;
    
        try {
            await sequelize.transaction(async (t) => {
                const curModelId = await AssetTypeVariant.findByPk(variantId);
                if (!curModelId) {
                    return res.status(400).json({ error: "Model Name does not exist!" });
                }
    
                let vendorId;
                if (isNewVendor) {
                    let cur_vendor = await Vendor.findOne({
                        where: { vendorName: { [Op.iLike]: vendorName } },
                        transaction: t
                    });
                    if (cur_vendor) {
                        throw new Error(`Vendor ${trimmedVendorName} already exists!`);
                    }
                    vendorId = nanoid();
                    await Vendor.create({ id: vendorId, vendorName: trimmedVendorName }, { transaction: t });
                } else {
                    cur_vendor = await Vendor.findOne({
                        where: { vendorName: { [Op.iLike]: vendorName } },
                        attributes: ['id'],
                        transaction: t
                    });
                    if (!cur_vendor) {
                        throw new Error(`Vendor ${vendorName} not found!`);
                    }
                    vendorId = cur_vendor.id;
                }
            
                const serialNums = new Set();
                const assetTags = new Set();
                for (const asset of assets) {
                    const { serialNumber, assetTag, remarks } = asset;
                    assetTag = assetTag.toUpperCase()
                    serialNumber = serialNumber.toUpperCase()
                    if (await Asset.findOne({ where: { assetTag: assetTag }, transaction: t })) {
                        throw new Error(`Asset Tag ${assetTag} already exists!`);
                    }
                    if (await Asset.findOne({ where: { serialNumber: serialNumber }, transaction: t })) {
                        throw new Error(`Serial Number ${serialNumber} already exists!`);
                    }
                    if (assetTags.has(assetTag)) {
                        throw new Error(`Duplicate Asset Tag ${assetTag}!`);
                    }
                    if (serialNums.has(serialNumber)) {
                        throw new Error(`Duplicate Serial Number ${serialNumber}!`);
                    }
                    const assetId = nanoid();
                    await Asset.create({
                        id: assetId,
                        serialNumber: serialNumber.toUpperCase(),
                        assetTag: assetTag.toUpperCase(),
                        variantId: variantId,
                        bookmarked: false,
                        status: 'AVAILABLE',
                        location: 'unknown',
                        value: value,
                        vendorId: vendorId
                    }, { transaction: t });
                    await FormHelpers.insertAssetEvent(nanoid(), assetId, eventTypes.ADD_ASSET, remarks, t);
                    assetTags.add(assetTag.toUpperCase());
                    serialNums.add(serialNumber.toUpperCase())
                }
            }).catch(err => {
                return res.status(400).json({ error: err.message });
            });
    
            console.log("Finish registering");
            return res.sendStatus(200);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    async condemn (req, res) {
        const data = req.body.data; // Array of asset details
    
        try {
            const assetIds = new Set();
            await sequelize.transaction(async (t) => {
                for (const { assetId, assetTag, remarks } of data) {
                    if (assetIds.has(assetId)) {
                        throw new Error("Can't delete the same device!");
                    }
                    const asset = await Asset.findByPk(assetId, { 
                        attributes: ['status'],
                        transaction: transaction
                    });         
                    if (!asset) {
                        throw new Error(`Asset tag ${assetTag} not found!`);
                    }
                    if (asset.status === "loaned") {
                        throw new Error(`Asset tag ${assetTag} still on loan!`);
                    }
                    if (asset.status === "condemned") {
                        throw new Error(`Asset tag ${assetTag} is already condemned!`);
                    }
                    assetIds.add(assetId);
                    
                    // Update the status and log the event
                    await FormHelpers.insertAssetEvent(nanoid(), assetId, "condemned", remarks, t);
                    await FormHelpers.updateStatus(assetId, "condemned", t);
                }
            });
            console.log("Finished processing asset deletions");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset deletion:", error);
            return res.status(400).json({ error: error.message });
        }
    };
}

module.exports = new FormAssetController();