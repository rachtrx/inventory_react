const { Op } = require('sequelize');
const { Usr, sequelize, Event, Rmk, UsrTag, UsrTagMap, UsrTagMapDel } = require('../../models/index.js');
const logger = require('../../logging.js');
const EventDTO = require('../../dtos/event.dto.js');
const { UserTagSearch } = require('../../search_tools/UserTag.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');
const { pendingOrCancelledEventCondition } = require('../utils.js');

class AddUserTagController {

    async loadAddUsers(req, res) {
        try {
            const search = new UserTagSearch(req.query)
            const users = await search.run(true)

            users.forEach(user => {
                user.value = user.userName;
                user.label = user.userName;
                if (req.query.tagId) {
                    user.tags.sort((a, b) => {
                        return b.tagId === req.query.tagId - a.tagId === req.query.tagId;
                    });
                }
                user.isDisabled = req.query.tagId && user.tags?.some(tag => tag.tagId === req.query.tagId)
            })
            // console.log(users);
            res.json(users);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    };

    async addUserTag(req, res) {
        try {
            const { tags } = req.body;
            const authId = req.auth.id;
            await this._dbAdd(tags, authId);
            return res.json({ message: 'All tags added successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while creating the tags: ${error.message}`);
        }
    }

    async scheduleAddUserTag(req, res) {
        try {
            const { tags, expectedDate } = req.body;
            const authId = req.auth.id;
            await this._dbAdd(tags, authId, expectedDate);
            return res.json({ message: 'All tags scheduled to add successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while creating the tags: ${error.message}`);
        }
    }


    async _dbAdd(newTags, authId, expectedDate=null) {
        logger.info(newTags);
        const transaction = await sequelize.transaction(); // Start transaction

        const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

        try {
            for (const { tagId, tagName, users } of newTags) {

                let tag;
                if (tagId && tagId !== '') {
                    tag = await UsrTag.findByPk(tagId, { transaction }); // Ensure it's inside transaction
                    if (!tag?.id) throw new Error(`Tag ${tagName} has ID but was not found`)
                } else {
                    tag = await UsrTag.create({
                        id: generateSecureID(),
                        tagName: tagName
                    }, { transaction });
                }

                // console.log(tag);
                
                for (const { userId, remarks, userName } of users) {

                    const tagExists = await UsrTagMap.findOne({
                        include: {
                            model: UsrTagMapDel,
                            where: pendingOrCancelledEventCondition(),
                            required: false
                        },
                        where: {
                            tagId: tag.id,
                            userId: userId,
                        },
                        transaction
                    })

                    if (tagExists) throw new Error(`Tag ${tagName} already exists for ${userName}`)

                    const user = await Usr.findOne({
                        where: {
                            id: userId,
                            delEventId: { [Op.eq]: null }
                        },
                        transaction
                    });

                    if (!user) {
                        throw new Error(`user with ID ${userId} not found.`);
                    }

                    const addEventId = generateSecureID();
                    
                    await Event.create({
                        id: addEventId,
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
                            eventId: addEventId,
                            remarkDate: addDate,
                            remarks: remarks,
                            adminId: authId
                        }, { transaction: transaction });
                    }

                    await UsrTagMap.create({
                        id: generateSecureID(),
                        tagId: tag.id,
                        userId: userId,
                        addEventId: addEventId,
                    }, { transaction: transaction });
                }
            }

            await transaction.commit();
            // console.log("succcessful transaction");
            return res.json({ message: 'All tags added successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while creating the tags: ${error.message}`);
        }
    };

    async confirmAdd(req, res) {
        
    }

    async cancelAdd(req, res) {

    }
}

module.exports = new AddUserTagController();