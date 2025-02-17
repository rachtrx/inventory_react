const logger = require('../logging.js');
const { Rmk, sequelize } = require('../models/index.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');


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
}

const eventController = new EventController();
module.exports = eventController;