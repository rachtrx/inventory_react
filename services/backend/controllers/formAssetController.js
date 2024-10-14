const { Ast, AstType, AstSType, Vendor } = require('../models/postgres');
const { Op } = require('sequelize');
const FormHelpers = require('./formHelperController.js');
const { eventTypes } = require('./utils.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');

class FormAssetController {

    async getAssetTypes (req, res) {
        const assetTypes = await AstType.findAll({
            where: { id: { [Op.not]: null } },
            order: [['typeName', 'ASC']],
            attributes: ['typeName']
        });
    
        return res.json(assetTypes.map(a => a.typeName));
    };
    
    async getAssetTypeVariants (req, res) {
        console.log(`Usr ID: ${req.session.userId}`);
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
        const { typeName, isNewAssetType, variants } = req.body;
    
        try {
            await sequelize.transaction(async (t) => {
                let assetTypeId;
    
                if (isNewAssetType) {
                    const existingAssetType = await AstType.findOne({
                        where: { typeName: { [Op.iLike]: typeName } },
                        transaction: t
                    });
    
                    if (existingAssetType) {
                        throw new Error(`Device Type ${typeName} already exists!`);
                    }
    
                    assetTypeId = generateSecureID();
                    await AstType.create({
                        id: assetTypeId,
                        typeName: typeName
                    }, { transaction: t });
                } else {
                    const existingAssetType = await AstType.findOne({
                        where: { typeName: { [Op.iLike]: typeName } },
                        attributes: ['id'],
                        transaction: t
                    });
    
                    if (!existingAssetType) {
                        throw new Error(`Device Type ${typeName} not found!`);
                    }
    
                    assetTypeId = existingAssetType.id;
                }
    
                // Check if subTypeName exists with case-insensitive search
                const existingVariant = await AstSType.findOne({
                    where: {
                        subTypeName: { [Op.iLike]: variants.subTypeName },
                        assetTypeId: assetTypeId
                    },
                    transaction: t
                });
    
                if (existingVariant) {
                    throw new Error(`AstSType ${variants.subTypeName} already exists!`);
                }
    
                // Create the subTypeName
                await AstSType.create({
                    id: generateSecureID(),
                    assetTypeId: assetTypeId,
                    subTypeName: variants.subTypeName
                }, { transaction: t });
            });
    
            console.log("Ast and its subTypeName created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset creation:", error);
            return res.status(400).json({ error: error.message });
        }
    };
    
    async register (req, res) {
        const data = req.body;
        const subTypeId = data.subTypeId; // TODO CONVERT TO DICT
        const vendorName = data.vendorName; // TODO CONVERT TO DICT
        const value = parseFloat(data.value).toFixed(2); // TODO CONVERT TO DICT
        const assets = data.assets; // TODO CONVERT TO DICT
        const isNewVendor = data.isNewVendor;
    
        try {
            await sequelize.transaction(async (t) => {
                const curModelId = await AstSType.findByPk(subTypeId);
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
                    vendorId = generateSecureID();
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
                    if (await Ast.findOne({ where: { assetTag: assetTag }, transaction: t })) {
                        throw new Error(`Ast Tag ${assetTag} already exists!`);
                    }
                    if (await Ast.findOne({ where: { serialNumber: serialNumber }, transaction: t })) {
                        throw new Error(`Serial Number ${serialNumber} already exists!`);
                    }
                    if (assetTags.has(assetTag)) {
                        throw new Error(`Duplicate Ast Tag ${assetTag}!`);
                    }
                    if (serialNums.has(serialNumber)) {
                        throw new Error(`Duplicate Serial Number ${serialNumber}!`);
                    }
                    const assetId = generateSecureID();
                    await Ast.create({
                        id: assetId,
                        serialNumber: serialNumber.toUpperCase(),
                        assetTag: assetTag.toUpperCase(),
                        subTypeId: subTypeId,
                        bookmarked: false,
                        status: 'AVAILABLE',
                        location: 'unknown',
                        value: value,
                        vendorId: vendorId
                    }, { transaction: t });
                    await FormHelpers.insertAssetEvent(generateSecureID(), assetId, eventTypes.ADD_ASSET, remarks, t);
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
                    const asset = await Ast.findByPk(assetId, { 
                        attributes: ['status'],
                        transaction: transaction
                    });         
                    if (!asset) {
                        throw new Error(`Ast tag ${assetTag} not found!`);
                    }
                    if (asset.status === "loaned") {
                        throw new Error(`Ast tag ${assetTag} still on loan!`);
                    }
                    if (asset.status === "condemned") {
                        throw new Error(`Ast tag ${assetTag} is already condemned!`);
                    }
                    assetIds.add(assetId);
                    
                    // Update the status and log the event
                    await FormHelpers.insertAssetEvent(generateSecureID(), assetId, "condemned", remarks, t);
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