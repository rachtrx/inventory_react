const { Usr, sequelize, Event, Rmk, UsrTag, UsrTagMap } = require('../../models/index.js');
const { Op } = require('sequelize');
const logger = require('../../logging.js');
const EventDTO = require('../../dtos/event.dto.js');
const { UserTagSearch } = require('../../search_tools/UserTag.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');

class FormUserTagController {

    async loadDelUsers(req, res) {
        try {
            const search = new UserTagSearch(req.query)
            const users = await search.run(false)

            users.forEach(user => {
                user.value = user.userName;
                user.label = user.userName;
                if (req.query.tagId) {
                    user.tags.sort((a, b) => {
                        return b.tagId === req.query.tagId - a.tagId === req.query.tagId;
                    });
                }
                user.isDisabled = req.query.tagId && !user.tags?.some(tag => tag.tagId === req.query.tagId)
            })

            // console.log(users);
            res.json(users);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    };

    async delUserTag(req, res) {
        try {
            const { tags } = req.body;
            const authId = req.auth.id;
            await this.delUserTag(tags, authId);
            return res.json({ message: 'All tags deleted successfully.' });
        } catch (error) {
            logger.error(error);
            // console.log("succcessful transaction");
            res.status(500).send(`An error occurred while deleting the tags: ${error.message}`);
        }
    }

    async scheduleDelUsrTag(req, res) {
        try {
            const { tags, expectedDate } = req.body;
            const authId = req.auth.id;
            await this.delUserTag(tags, authId, expectedDate);
            return res.json({ message: 'All tags scheduled for deletion successfully.' });
        } catch (error) {
            logger.error(error);
            // console.log("succcessful transaction");
            res.status(500).send(`An error occurred while deleting the tags: ${error.message}`);
        }
    }

    async delUserTag(removeTags, authId, expectedDate) {
        const transaction = await sequelize.transaction(); // Start transaction

        const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

        try {
            for (const { users } of removeTags) {
                
                for (const { userTagId, remarks } of users) {
                    const delEventId = generateSecureID();

                    await Event.create({
                        id: delEventId,
                        eventDate: curDate,
                        ...(expectedDate && { expectedCloseDate: expectedDate }),
                        ...(!expectedDate && {
                            closedDate: curDate,
                            closedAdminId: authId,
                        }),
                    }, { transaction: transaction });
            
                    if (remarks && remarks !== '') {
                        await Rmk.create({
                            id: generateSecureID(),
                            eventId: delEventId,
                            remarkDate: curDate,
                            remarks: remarks,
                            adminId: authId
                        }, { transaction: transaction });
                    }

                    await UsrTagMap.update(
                        { 
                            delEventId: delEventId
                        },
                        { 
                            where: { id: userTagId },
                            transaction: transaction
                        }
                    );
                }
            }
            
            await transaction.commit();
            return res.json({ message: 'All tags deleted successfully.' });
        } catch (error) {
            logger.error(error);
            // console.log("succcessful transaction");
            res.status(500).send(`An error occurred while deleting the tags: ${error.message}`);
        }
    }
}

module.exports = new FormUserTagController();