const logger = require('../../logging.js');
const { Rmk, sequelize, AstType, AccTxn, AccType, Usr, UsrDelete, UsrTagMap } = require('../../models/index.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');


class EventController {

    async addRemark(req, res) {
        try {
            const t = await sequelize.transaction();

            const {eventId, remark, dateTime} = req.body;
            const adminId = req.auth.id;

            if (remark && remark !== "") {
                await Rmk.create(
                    {
                        id: generateSecureID(),
                        eventId: eventId,
                        text: remark,
                        remarkDate: dateTime,
                        adminId: adminId,
                    },
                    { transaction: t }
                );
            } else {
                throw new Error("Remark is required");
            }
            await t.commit();
            return res.json({ message: 'Remark added successfully.' });
        } catch (err) {
            logger.error(err)
            console.error("Remark failed to add:", err);
            return res.status(400).json({ error: err.message });
        }   
    }

    async getPendingEvents(filter={
        addAsset: true,
        delAsset: true,
        tagAsset: true,
        untagAsset: true,
        addAccessory: true,
        accTxn: true,
        addUser: true,
        delUser: true,
        tagUser: true,
        untagUser: true,
        loan: true,
        _return: true
    }) {
        const pendingEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.in]: eventIds } },
                    { closedDate: { [Op.eq]: null } }
                ]
            },
            include: [
                ...(addAsset && {
                    model: Ast,
                    attributes: ['serialNumber'],
                    required: false,
                }),
                ...(delAsset && {
                    model: AstDelete,
                    include: {
                        model: Ast,
                        attributes: ['serialNumber'],
                        required: true,
                    },
                    required: false,
                }),
                ...(tagAsset && {
                    model: AstTagMap,
                    as: 'AddedAstTag',
                    required: false,
                }),,
                ...(untagAsset && {
                    model: AstTagMap,
                    as: 'DeletedAstTag',
                    required: false,
                }),
                ...(addAccessory && {
                    model: AccType,
                    required: false,
                }),
                ...(accTxn && {
                    model: AccTxn,
                    attributes: ['serialNumber'],
                    required: false,
                }),
                ...(addUser && {
                    model: Usr,
                    attributes: ['userName'],
                    required: false,
                }),
                ...(delUser && {
                    model: UsrDelete,
                    required: false,
                }),
                ...(tagUser && {
                    model: UsrTagMap,
                    as: 'AddedUsrTag',
                    required: false,
                }),
                ...(untagUser && {
                    model: UsrTagMap,
                    as: 'DeletedUsrTag',
                    required: false,
                }),
                ...(loan && {
                    model: Ast,
                    attributes: ['serialNumber'],
                    required: false,
                }),
                ...(_return && {
                    model: Ast,
                    attributes: ['serialNumber'],
                    required: false,
                }),
            ],
        });

        if (pendingEvents.length === 0) {
            throw new Error("No valid pending events found.");
        }

        return pendingEvents;
    }

    async updatePendingEvents(eventIds, transaction, cancelled) {
        const pendingEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.in]: eventIds } },
                    { closedDate: { [Op.eq]: null } }
                ]
            },
            transaction
        });

        if (pendingEvents.length === 0) {
            throw new Error("No valid pending events found.");
        }

        for (const pendingEvent of pendingEvents) {
            if (!pendingEvent.Ast) {
                throw new Error(`Asset not found for event ID ${pendingEvent.id}`);
            }

            await pendingEvent.update(
                {
                    closedDate: new Date(),
                    cancelled
                },
                { transaction }
            );
        }

        return pendingEvents;
    }
}

const eventController = new EventController();
module.exports = eventController;