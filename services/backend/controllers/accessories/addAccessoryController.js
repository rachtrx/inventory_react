const { Ast, AstType, AstSType, Vendor, Event, Rmk, AstLoan, sequelize, AstReturn, AstDelete } = require('../../models/index.js');
const { Op } = require('sequelize');
const FormHelpers = require('../formHelperController.js');
const { eventTypes, successfulEventCondition, pendingOrCancelledEventCondition } = require('../utils.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');
const AccType = require('../../models/AccType.js');
// const { DateTime } = require("luxon");

// luxon: DateTime.now().setZone('Asia/Singapore').toJSDate()

class AddAccessoryController {

    async _dbAdd(accessories, adminId, expectedDate=null) {
        try {
            return await sequelize.transaction(async (transaction) => {
                const createdAccessories = await Promise.all(
                    accessories.map(async ({ accessoryName, count, remarks = "" }) => {
                        const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });
    
                        const accRow = await AccType.findOne({
                            attributes: ["accessoryName"],
                            where: { accessoryName },
                            include: [
                                {
                                    model: Event,
                                    attributes: ['id', 'closedDate'],
                                    required: false,
                                    where: { cancelled: false }
                                },
                            ],
                            transaction
                        });
    
                        if (accRow) {
                            throw new Error(`Accessory with name ${accessoryName} ${accRow.Event?.closedDate ? 'already exists' : 'is already scheduled to add'}.`);
                        }
    
                        const addAccTypeEventId = generateSecureID();
    
                        const event = await Event.create({
                            id: addAccTypeEventId,
                            openedDate: curDate,
                            openedAdminId: adminId,
                            ...(expectedDate && { expectedCloseDate: expectedDate }),
                            ...(!expectedDate && {
                                closedDate: curDate,
                                closedAdminId: adminId,
                            })
                        }, { transaction });
    
                        if (remarks && remarks !== "") {
                            await Rmk.create({
                                id: generateSecureID(),
                                remarks: remarks,
                                eventId: addAccTypeEventId
                            }, { transaction });
                        }
    
                        const accType = await AccType.create({ 
                            id: generateSecureID(), 
                            accessoryName,
                            stock: count,
                            addEventId: event.id
                        }, { transaction });
    
                        return accType;
                    })
                );
                return createdAccessories;
            });
        } catch (error) {
            logger.info(error);
            throw error;
        }
    }
    
    
    async add(req, res) {
        const { accessories } = req.body; // Assuming `types` is an array of asset types with their subtypes

        const adminId = req.auth.id;
    
        if (!accessories || !Array.isArray(accessories)) {
            return res.status(400).json({ error: "Asset Types must be an array!" });
        }
    
        try {
            const accTypes = await this._dbAdd(accessories, adminId, true);
            console.log("Accessories created successfully");
            return res.status(200).json({
                message: "Accessories created successfully",
                accTypes
            });
        } catch (error) {
            console.error("Error during asset creation:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async scheduleAdd(req, res) {
        const { accessories, expectedDate } = req.body; // Assuming `types` is an array of asset types with their subtypes

        const adminId = req.auth.id;
    
        if (!accessories || !Array.isArray(accessories)) {
            return res.status(400).json({ error: "Asset Types must be an array!" });
        }
    
        try {
            const accTypes = await this._dbAdd(accessories, adminId, expectedDate);
            console.log("Accessories scheduled successfully");
            return res.sendStatus(200).json({
                message: "Accessories scheduled successfully",
                accTypes
            });
        } catch (error) {
            console.error("Error during asset creation:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    // SECTION confirm / cancel
    async _getPendingAddAccessories(eventIds, transaction) {
        const pendingEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.in]: eventIds } },
                    { closedDate: { [Op.eq]: null } }
                ]
            },
            include: [{
                model: AccType,
                attributes: ['accessoryName'],
                required: true,
            }],
            transaction
        });

        if (pendingEvents.length === 0) {
            throw new Error("No valid pending events found.");
        }

        return pendingEvents;
    }

    async cancelAddAccessory(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingAddAccessories(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.AccType) {
                    throw new Error(`Accessory Type not found for event ID ${pendingEvent.id}`);
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

    async confirmAddAccessory(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingAddAccessories(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.AccType) {
                    throw new Error(`Accessory Type not found for event ID ${pendingEvent.id}`);
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

module.exports = new AddAccessoryController();

// async handleNewAccessories() {
//     const newAccessories = {}; // tracks <newAccTypeName>: <newAccTypeId>
//     for (const { loans } of this.users) {
//         for (const loan of loans) {
//             if (loan.accessories) {
//                 for (const accessory of loan.accessories) {
//                     let accType;

//                     // id === name means new. Check if added to newAccessories already
//                     if (!accessory.accessoryTypeId && accessory.accessoryName && !newAccessories[accessory.accessoryName]) {
//                         accType = await addAccessoryController.createAccessoryType(
//                             accessory.accessoryName,
//                             0,
//                             this.authId,
//                             this.transaction
//                         );
//                         console.log(`New accessory ${accType.accessoryName} created`);
//                         newAccessories[accessory.accessoryName] = accType.id;
//                         accessory.accessoryTypeId = accType.id;
//                     } else if (newAccessories[accessory.accessoryName]) {
//                         // if new but added to newAccessories already, just need to update the id
//                         accessory.accessoryTypeId = newAccessories[accessory.accessoryName];
//                     }
//                 }
//             }
//         }
//     }
// }