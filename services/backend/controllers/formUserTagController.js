const { Usr, sequelize, Event, Rmk, UsrTag, UsrTagMap } = require('../models/index.js');
const { Op } = require('sequelize');
const logger = require('../logging.js');
const EventDTO = require('../dtos/event.dto.js');
const { UserTagSearch } = require('../search_tools/UserTag.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');

class FormUserTagController {

    async loadAddUsers(req, res) {
        try {
            console.log(req.query.tagId);
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
            console.log(users);
            res.json(users);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    };

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

            console.log(users);
            res.json(users);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    };


    async addUserTag(req, res) {
        const newTags = req.body.tags;
        logger.info(newTags);
        const transaction = await sequelize.transaction(); // Start transaction

        const authId = req.auth.id;

        const addDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

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

                console.log(tag);
                
                for (const { userId, remarks, userName } of users) {

                    const tagExists = await UsrTagMap.findOne({
                        where: {
                            tagId: tag.id,
                            userId: userId,
                            delEventId: { [Op.eq]: null }
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
                        eventDate: addDate,
                        adminId: authId,
                    }, { transaction: transaction });
            
                    if (remarks !== '') {
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
            console.log("succcessful transaction");
            return res.json({ message: 'All tags added successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while creating the tags: ${error.message}`);
        }
    };

    async delUserTag(req, res) {
        const removeTags = req.body.tags;
        const transaction = await sequelize.transaction(); // Start transaction

        const authId = req.auth.id;

        const delDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

        try {
            for (const { users } of removeTags) {
                
                for (const { userTagId, remarks } of users) {
                    const delEventId = generateSecureID();

                    await Event.create({
                        id: delEventId,
                        eventDate: delDate,
                        adminId: authId,
                    }, { transaction: transaction });
            
                    if (remarks !== '') {
                        await Rmk.create({
                            id: generateSecureID(),
                            eventId: delEventId,
                            remarkDate: delDate,
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
            console.log("succcessful transaction");
            res.status(500).send(`An error occurred while deleting the tags: ${error.message}`);
        }
    }
}

module.exports = new FormUserTagController();