const { Ast, AstType, AstSType, Vendor, Event, Rmk, AstLoan, sequelize } = require('../models');
const { Op } = require('sequelize');
const FormHelpers = require('./formHelperController.js');
const { eventTypes } = require('./utils.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const logger = require('../logging.js');
const { AssetDelete } = require('../search_tools/assetDelete.js');
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
        // console.log(`Usr ID: ${req.session.userId}`);
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
        // console.log(`Usr ID: ${req.session.userId}`);
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

    async createNewVendor(req, res) {
        const { vendorName } = req.body;

        try {
            const transaction = await sequelize.transaction();
    
            const existingVendor = await Vendor.findOne({
                where: { vendorName: { [Op.eq]: vendorName } },
                attributes: ['id', 'vendorName'],
                transaction,
            });
    
            if (existingVendor) {
                throw new Error(`${vendorName} already exists!`);
            }
    
            const vendor = await Vendor.create(
                {
                    id: generateSecureID(),
                    vendorName: vendorName,
                },
                { transaction }
            );
            transaction.commit();

            return res.json({
                message: `${vendor.vendorName} created successfully`,
                newVendor: vendor.get({plain: true})
            });
        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    async createNewAssetType(req, res) {
        const { typeName } = req.body;

        try {
            const transaction = await sequelize.transaction();
    
            const existingAssetType = await AstType.findOne({
                where: { typeName: { [Op.eq]: typeName } },
                attributes: ['id', 'typeName'],
                transaction,
            });
    
            if (existingAssetType) {
                throw new Error(`${typeName} already exists!`);
            }
    
            const assetType = await AstType.create(
                {
                    id: generateSecureID(),
                    typeName: typeName,
                },
                { transaction }
            );
            transaction.commit();
            console.log(assetType.get({plain: true}));

            return res.json({
                message: `${assetType.typeName} created successfully`,
                newType: assetType.get({plain: true})
            });

        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    async createNewAssetSubType(req, res) {
        const { typeId, subTypeName } = req.body;

        try {
            const transaction = await sequelize.transaction();

            const existingAssetSubType = await AstSType.findOne({
                where: {
                    subTypeName: { [Op.eq]: subTypeName },
                },
                include: {
                    model: AstType,
                    attributes: ['typeName'],
                },
                transaction,
            });

            if (existingAssetSubType) {
                throw new Error(
                    `${subTypeName} already exists under type ${existingAssetSubType.AstType.typeName}!`
                );
            }

            const assetSubType = await AstSType.create(
                {
                    id: generateSecureID(),
                    assetTypeId: typeId,
                    subTypeName: subTypeName,
                },
                { transaction }
            );
            transaction.commit();
            return res.json({
                message: `${assetSubType.subTypeName} created successfully`,
                newSubType: assetSubType.get({plain: true})
            });
            
        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }
    
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

                        console.log(typeId);
                        
                        const existingAssetType = await AstType.findOne({
                            where: { id: typeId },
                            attributes: ['id', 'typeName'],
                            transaction: t,
                        });
                        
                        if (!existingAssetType) {
                            throw new Error(`${typeName} not found!`);
                        }
            
                        await Promise.all(
                            subTypes.map(async ({ subTypeId, subTypeName, assets }) => {
                                const existingAssetSubType = await AstSType.findOne({
                                    where: {
                                        [Op.and]: [
                                            { id: { [Op.eq]: subTypeId } },
                                            { assetTypeId: { [Op.eq]: typeId } },
                                        ]
                                    },
                                    transaction: t,
                                });
            
                                if (!existingAssetSubType) {
                                    throw new Error(
                                        `${subTypeName} not found!`
                                    );
                                }
            
                                await Promise.all(
                                    assets.map(async ({ vendorId, vendorName, ...rest }) => {
                                        let existingVendor = await Vendor.findOne({
                                            attributes: ['id'],
                                            where: { id: { [Op.eq]: vendorId } },
                                            transaction: t,
                                        });
            
                                        if (!existingVendor) {
                                            throw new Error(`${vendorName} not found!`);
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
            
                                        if (rest.remarks && rest.remarks !== "") {
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
                                                alias: rest.alias.toUpperCase(),
                                                subTypeId: subTypeId,
                                                bookmarked: rest.bookmarked ? true : false,
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

    async del (req, res) {
        // console.log(req.body);
        const data = req.body.assets; // Array of asset details

        // console.log(data);

        const adminId = req.auth.id;
    
        try {
            const assetIds = new Set();
            await sequelize.transaction(async (t) => {
                for (const { assetId, serialNumber, remarks, delDate } of data) {
                    if (assetIds.has(assetId)) {
                        throw new Error("Can't delete the same device!");
                    }
                    const asset = await Ast.findByPk(assetId, { // TODO combine with the search one?
                        include: {
                            model: AstLoan,
                            attributes: ["returnEventId"],
                            required: false,
                            where: { returnEventId: { [Op.ne]: null } }, // Fixed syntax for where condition
                        },
                        transaction: t
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
                    if (remarks && remarks !== '') {
                        await Rmk.create(
                            {
                                id: generateSecureID(),
                                eventId: delEventId,
                                text: remarks,
                                remarkDate: delDate,
                                // DateTime.now()
                                //     .setZone('Asia/Singapore')
                                //     .toJSDate(),
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
                const aliases = new Set();
                for (const asset of assets) {
                    const { serialNumber, alias, remarks } = asset;
                    alias = alias.toUpperCase()
                    serialNumber = serialNumber.toUpperCase()
                    if (await Ast.findOne({ where: { alias: alias }, transaction: t })) {
                        throw new Error(`Ast AstTag ${alias} already exists!`);
                    }
                    if (await Ast.findOne({ where: { serialNumber: serialNumber }, transaction: t })) {
                        throw new Error(`Serial Number ${serialNumber} already exists!`);
                    }
                    if (aliases.has(alias)) {
                        throw new Error(`Duplicate Ast AstTag ${alias}!`);
                    }
                    if (serialNums.has(serialNumber)) {
                        throw new Error(`Duplicate Serial Number ${serialNumber}!`);
                    }
                    const assetId = generateSecureID();
                    await Ast.create({
                        id: assetId,
                        serialNumber: serialNumber.toUpperCase(),
                        alias: alias.toUpperCase(),
                        subTypeId: subTypeId,
                        bookmarked: false,
                        status: 'AVAILABLE',
                        location: 'unknown',
                        value: value,
                        vendorId: vendorId
                    }, { transaction: t });
                    await FormHelpers.insertAssetEvent(generateSecureID(), assetId, eventTypes.ADD_ASSET, remarks, t);
                    aliases.add(alias.toUpperCase());
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

    async loadAstDel (req, res) {
        try {
            const search = new AssetDelete(req.query)
            const query = await search.run()

            const assets = query.map(
                asset => ({
                        ...asset,
                        value: asset.serialNumber,
                        label: asset.serialNumber,
                        isDisabled: asset.delEventId || asset.loan || asset.reservation
                })
            )
            // console.log(assets);
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new FormAssetController();