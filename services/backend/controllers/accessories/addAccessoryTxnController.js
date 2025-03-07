const { Ast, AstType, AstSType, Vendor, Event, Rmk, AstLoan, sequelize, AstReturn, AstDelete, AccTxn } = require('../../models/index.js');
const { Op } = require('sequelize');
const FormHelpers = require('../formHelperController.js');
const { eventTypes, successfulEventCondition, pendingOrCancelledEventCondition } = require('../utils.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');
const AccType = require('../../models/AccType.js');
// const { DateTime } = require("luxon");

// luxon: DateTime.now().setZone('Asia/Singapore').toJSDate()

class AddAccessoryTxnController {

    async _dbAdd(accessories, adminId, closed) {
        try {
            await sequelize.transaction(async (transaction) => {
                await Promise.all(
                    accessories.map(async ({ accessoryTypeId, count, remarks="" }) => {
                    
                        const accRow = await AccType.findByPk(accessoryTypeId, {
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
                        }, { transaction })

                        if (!accRow.Event.closedDate) {
                            throw new Error(`Accessory with name ${accessoryName} 'is not added yet'}.`);
                        }

                        const addAccTypeEventId = generateSecureID();
                        const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

                        const event = await Event.create({
                            id: addAccTypeEventId,
                            openedDate: curDate,
                            openedAdminId: adminId, // req.auth.id
                            ...(closed && {
                                closedDate: curDate,
                                closedAdminId: adminId,
                            })
                        }, { transaction });

                        if (remarks && remarks !== "") {
                            await Rmk.create({
                                id: generateSecureID(),
                                remarks: remarks,
                                eventId: event.id
                            }, { transaction });
                        }

                        await AccTxn.create({
                            id: generateSecureID(),
                            accessoryTypeId: accessoryTypeId,
                            count: count,
                            eventId: event.id
                        }, { transaction: transaction });

                        const accType = await AccType.findByPk(accessoryTypeId);

                        accType.stock += count;
                        await accType.save({ transaction })

                        return res.json({
                            message: `Accessory transaction added successfully.`,
                            newCount: accType.stock
                        });
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
            return res.status(400).json({ error: "AccTxn Types must be an array!" });
        }
    
        try {
            await this._dbAdd(types, adminId, true);
            console.log("AccTxns and their subTypeNames created successfully");
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
            return res.status(400).json({ error: "AccTxn Types must be an array!" });
        }
    
        try {
            await this._dbAdd(types, adminId, false);
            console.log("AccTxns and their subTypeNames created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset creation:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    // SECTION confirm / cancel
    async _getPendingAddAccTxns(eventIds, transaction) {
        const pendingEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.in]: eventIds } },
                    { closedDate: { [Op.eq]: null } }
                ]
            },
            include: [{
                model: AccTxn,
                required: true,
            }],
            transaction
        });

        if (pendingEvents.length === 0) {
            throw new Error("No valid pending events found.");
        }

        return pendingEvents;
    }

    async cancelAddAccTxn(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingAddAccTxns(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.ActTxn) {
                    throw new Error(`AccTxn not found for event ID ${pendingEvent.id}`);
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
            return res.status(200).json({ message: "AccTxns successfully cancelled" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }

    async confirmAddAccTxn(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingAddAccTxns(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.AccTxn) {
                    throw new Error(`AccTxn not found for event ID ${pendingEvent.id}`);
                }
    
                await pendingEvent.update(
                    { closedDate: new Date() },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "AccTxns successfully confirmed" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }

}

module.exports = new AddAccessoryTxnController();