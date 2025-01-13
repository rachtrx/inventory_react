const { Ast, AstType, AstSType, Vendor, Event, Rmk, AstLoan } = require('../models');
const { Op } = require('sequelize');
const FormHelpers = require('./formHelperController.js');
const { eventTypes } = require('./utils.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
// const { DateTime } = require("luxon");

// luxon: DateTime.now().setZone('Asia/Singapore').toJSDate()

class FormAssetController {

    async getAssetTypes (req, res) {
        const assetTypes = await AstType.findAll({
            where: { id: { [Op.not]: null } },
            order: [['typeName', 'ASC']],
            attributes: ['typeName']
        });
    
        return res.json(assetTypes.map(a => a.typeName));
    };
    
    async getVendors (req, res) {
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

    async getAssetSubTypes (req, res) {
        console.log(`Usr ID: ${req.session.userId}`);
        try {
            const sTypes = await AstSType.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('subTypeName')), 'subTypeName']],
                order: [['subTypeName', 'ASC']]
            });
            return res.json(sTypes.map(subType => subType.subTypeName));
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };
    
    async add(req, res) {
        const { types } = req.body; // Assuming `types` is an array of asset types with their subtypes

        const adminId = req.auth.id;
    
        if (!types || !Array.isArray(types)) {
            return res.status(400).json({ error: "Asset Types must be an array!" });
        }
    
        try {
            await sequelize.transaction(async (t) => {
                await Promise.all(
                    types.map(async ({ typeId, typeName, subTypes }) => {
                        let assetTypeId = typeId;
            
                        if (!assetTypeId) {
                            const existingAssetType = await AstType.findOne({
                                where: { typeName: { [Op.iLike]: typeName.toLowerCase() } },
                                attributes: ['id', 'typeName'],
                                transaction: t,
                            });
            
                            if (existingAssetType) {
                                throw new Error(`${typeName} already exists!`);
                            }
            
                            const assetType = await AstType.create(
                                {
                                    id: generateSecureID(),
                                    typeName: typeName,
                                },
                                { transaction: t }
                            );
            
                            assetTypeId = assetType.id;
                        }
            
                        await Promise.all(
                            subTypes.map(async ({ subTypeId, subTypeName, assets }) => {
                                let assetSubTypeId = subTypeId;
            
                                if (!assetSubTypeId) {
                                    const existingAssetSubType = await AstSType.findOne({
                                        where: {
                                            subTypeName: { [Op.iLike]: subTypeName },
                                        },
                                        include: {
                                            model: AstType,
                                            attributes: ['typeName'],
                                        },
                                        transaction: t,
                                    });
            
                                    if (existingAssetSubType) {
                                        throw new Error(
                                            `${subTypeName} already exists under type ${existingAssetSubType.AstType.typeName}!`
                                        );
                                    }
            
                                    const assetSubType = await AstSType.create(
                                        {
                                            id: generateSecureID(),
                                            assetTypeId: assetTypeId,
                                            subTypeName: subTypeName,
                                        },
                                        { transaction: t }
                                    );
            
                                    assetSubTypeId = assetSubType.id;
                                }
            
                                await Promise.all(
                                    assets.map(async ({ vendor, ...rest }) => {
                                        let vendorData = await Vendor.findOne({
                                            attributes: ['id'],
                                            where: { vendorName: { [Op.iLike]: vendor } },
                                            transaction: t,
                                        });
            
                                        let vendorId = vendorData?.id || generateSecureID();
            
                                        if (!vendorData) {
                                            await Vendor.create(
                                                {
                                                    id: vendorId,
                                                    vendorName: vendor,
                                                },
                                                { transaction: t }
                                            );
                                        }
            
                                        const addEventId = generateSecureID();
            
                                        await Event.create(
                                            {
                                                id: addEventId,
                                                eventDate: rest.addDate,
                                                adminId: adminId,
                                            },
                                            { transaction: t }
                                        );
            
                                        if (rest.remarks) {
                                            await Rmk.create(
                                                {
                                                    id: generateSecureID(),
                                                    eventId: addEventId,
                                                    text: rest.remarks,
                                                    remarkDate: rest.addDate,
                                                    adminId: adminId,
                                                },
                                                { transaction: t }
                                            );
                                        }
            
                                        await Ast.create(
                                            {
                                                id: generateSecureID(),
                                                serialNumber: rest.serialNumber.toUpperCase(),
                                                assetTag: rest.assetTag.toUpperCase(),
                                                subTypeId: assetSubTypeId,
                                                shared: rest.shared || false,
                                                bookmarked: rest.bookmarked,
                                                leased: rest.leased || false,
                                                location: rest.location,
                                                vendorId: vendorId,
                                                addEventId: addEventId,
                                                value: parseFloat(rest.cost || 0).toFixed(2),
                                            },
                                            { transaction: t }
                                        );
                                    })
                                );
                            })
                        );
                    })
                );
            });
    
            console.log("Assets and their subTypeNames created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset creation:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async condemn (req, res) {
        const data = req.body.assets; // Array of asset details

        const adminId = req.auth.id;
    
        try {
            const assetIds = new Set();
            await sequelize.transaction(async (t) => {
                for (const { assetId, serialNumber, remarks, delDate } of data) {
                    if (assetIds.has(assetId)) {
                        throw new Error("Can't delete the same device!");
                    }
                    const asset = await Ast.findByPk(assetId, {
                        attributes: ["delEventId"],
                        include: {
                            model: AstLoan,
                            attributes: ["returnEventId"],
                            required: false,
                            where: { returnEventId: { [Op.ne]: null } } // Fixed syntax for where condition
                        },
                        transaction: transaction
                    });
                    
                    if (!asset) {
                        throw new Error(`Asset ${serialNumber} not found!`);
                    }
                    
                    if (asset.delEventId) {
                        throw new Error(`Asset ${serialNumber} is already condemned!`);
                    }
                    
                    if (asset.AstLoans && asset.AstLoans.length > 0) {
                        throw new Error(`Asset ${serialNumber} is still on loan!`);
                    }
                    
                    assetIds.add(assetId);
                    
                    const delEventId = generateSecureID();
                    
                    // Create the deletion event
                    await Event.create(
                        {
                            id: delEventId,
                            eventDate: delDate,
                            adminId: adminId,
                        },
                        { transaction: t }
                    );
                    
                    // Add remarks if provided
                    if (remarks) {
                        await Rmk.create(
                            {
                                id: generateSecureID(),
                                eventId: delEventId,
                                text: remarks,
                                remarkDate: DateTime.now()
                                    .setZone('Asia/Singapore')
                                    .toJSDate(),
                                adminId: adminId,
                            },
                            { transaction: t }
                        );
                    }
                    
                    // Update the asset with the delEventId and save it
                    await asset.update(
                        { delEventId: delEventId },
                        { transaction: t }
                    );
                }
            });

            console.log("Finished processing asset deletions");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset deletion:", error);
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
}

module.exports = new FormAssetController();