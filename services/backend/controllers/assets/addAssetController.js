const { Ast, AstType, AstSType, Vendor, Event, Rmk, AstLoan, sequelize, AstReturn, AstDelete } = require('../../models/index.js');
const { Op } = require('sequelize');
const { eventTypes, successfulEventCondition, pendingOrCancelledEventCondition } = require('../utils.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');
// const { DateTime } = require("luxon");

// luxon: DateTime.now().setZone('Asia/Singapore').toJSDate()

class AddAssetController {

    async _validateAssetIsAddable(serialNumber, t) {
        const assets = await Ast.findAll({
            where: { serialNumber: serialNumber },
            attributes: ['serialNumber'],
            include: [
                {
                    model: AstSType,
                    attributes: ['subTypeName'],
                    include: {
                        model: AstType,
                        attributes: ['typeName']
                    },
                },
                {
                    model: Event, // scheduled to add / added
                    attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate', 'cancelled'],
                },
                {
                    model: AstDelete, // scheduled to delete
                    include: {
                        model: Event,
                        attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate', 'cancelled'],
                        where: { cancelled: false }
                    },
                    required: false,
                }
            ],
            transaction: t,
        })
        return assets;
    }

    async createNewAssetType(req, res) { // TODO reload filters on frontend after created
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

            return res.json(assetType.get({plain: true}));

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
            return res.json(assetSubType.get({ plain: true}));
            
        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    async _dbAdd(types, adminId, closed) {
        try {
            await sequelize.transaction(async (t) => {
                await Promise.all(
                    types.map(async ({ typeId, typeName, subTypes }) => {
                        let assetTypeId = typeId; // TODO remove?
            
                        if (!assetTypeId) {
                            throw new Error(`Asset Type not found for ${typeName}`)
                        }
            
                        await Promise.all(
                            subTypes.map(async ({ subTypeId, subTypeName, assets }) => {
                                let assetSubTypeId = subTypeId; // TODO remove?

                                if (!subTypeId) {
                                    throw new Error(`Asset Sub Type not found for ${subTypeName} (${typeName})`);
                                }

                                const conflictingAssets = await Promise.all(
                                    assets.map(async asset => await this._validateAssetIsAddable(asset.serialNumber, t))
                                )

                                const conflictingAsset = conflictingAssets.some(conflictingAsset => conflictingAsset.AstSType.id === subTypeId)
                                if (conflictingAsset) {
                                    throw new Error(`Asset ${conflictingAsset.serialNumber} already exists under type ${conflictingAsset.AstSType.subTypeName}`);
                                }
            
                                await Promise.all(
                                    assets.map(async ({ vendorName, ...rest }) => {
                                        let vendorData = await Vendor.findOne({
                                            attributes: ['id'],
                                            where: { vendorName: { [Op.iLike]: vendorName } },
                                            transaction: t,
                                        });
            
                                        let vendorId = vendorData?.id || generateSecureID();
            
                                        if (!vendorData) {
                                            await Vendor.create(
                                                {
                                                    id: vendorId,
                                                    vendorName: vendorName,
                                                },
                                                { transaction: t }
                                            );
                                        }
            
                                        const addEventId = generateSecureID();
            
                                        await Event.create(
                                            {
                                                id: addEventId,
                                                openedDate: rest.addDate,
                                                openedAdminId: adminId,
                                                ...(closed && {
                                                    closedDate: rest.addDate,
                                                    closedAdminId: adminId,
                                                })
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
                                                assetTag: rest.assetTag.toUpperCase(),
                                                subTypeId: assetSubTypeId,
                                                bookmarked: rest.bookmarked ? 1 : 0,
                                                leased: rest.leased ? 1 : 0,
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
        } catch (error) {
            logger.info(error);
            throw error;
        }
    }
    
    async add(req, res) {
        const { types } = req.body; // Assuming `types` is an array of asset types with their subtypes

        const adminId = req.auth.id;
    
        if (!types || !Array.isArray(types)) {
            return res.status(400).json({ error: "Asset Types must be an array!" });
        }
    
        try {
            await this._dbAdd(types, adminId, true);
            console.log("Assets and their subTypeNames created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset creation:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async scheduleAdd(req, res) {
        const { types } = req.body; // Assuming `types` is an array of asset types with their subtypes

        const adminId = req.auth.id;
    
        if (!types || !Array.isArray(types)) {
            return res.status(400).json({ error: "Asset Types must be an array!" });
        }
    
        try {
            await this._dbAdd(types, adminId, false);
            console.log("Assets and their subTypeNames created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset creation:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    // SECTION confirm / cancel
    async _getPendingAddAssets(eventIds, transaction) {
        const pendingEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.in]: eventIds } },
                    { closedDate: { [Op.eq]: null } }
                ]
            },
            include: [{
                model: Ast,
                attributes: ['serialNumber'],
                required: true,
            }],
            transaction
        });

        if (pendingEvents.length === 0) {
            throw new Error("No valid pending events found.");
        }

        return pendingEvents;
    }

    async cancelAddAsset(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingAddAssets(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.Ast) {
                    throw new Error(`Asset not found for event ID ${pendingEvent.id}`);
                }
    
                await pendingEvent.update(
                    {
                        closedDate: new Date(),
                        cancelled: true
                    },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "Assets successfully cancelled" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }

    async confirmAddAsset(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingAddAssets(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.Ast) {
                    throw new Error(`Asset not found for event ID ${pendingEvent.id}`);
                }
    
                await pendingEvent.update(
                    { closedDate: new Date() },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "Assets successfully confirmed" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AddAssetController();


// async getAddAssetIssues(req, res) {
//     // check for added / scheduled / pending delete
//     const { serialNumbers } = req.body;

//     const transaction = await sequelize.transaction();

//     try {
//         const assets = await Promise.all(serialNumbers.map(async serialNumber => {
//             await this._validateAssetIsAddable(serialNumber, transaction)
//         }))

//         if (!assets || assets.length === 0) return res.status(200)

//         return res.status(500).json(assets.reduce((issues, asset) => {
//             if (!issues[asset.serialNumber]) {
//                 issues[asset.serialNumber] = []
//             }
//             issues[asset.serialNumber].push({
//                 subTypeName: asset.AstSType.subTypeName,
//                 typeName: asset.AstSType.AstType.typeName,
//                 AddEvent: asset.AddEvent? asset.AddEvent.get({plain: true}) : null,
//                 DelEvents: asset.DelEvents? asset.DelEvents.map(delEvent => delEvent.get({plain: true})) : null,
//             })
//         }));
//     } catch (error) {
//         logger.info(error)
//         return res.status(500).json({ error: error.message });
//     }
// }