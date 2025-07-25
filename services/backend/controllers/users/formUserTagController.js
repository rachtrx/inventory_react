const { Usr, sequelize, Event, Rmk, UsrTag, UsrTagMap } = require('@models');
const { Op } = require('sequelize');
const logger = require('@/utils/logging.js');
const EventDTO = require('@dtos/event.dto.js');
const { UserTagSearch } = require('@services/search/user/userTag.js');
const { generateSecureID } = require('@utils/validation.js');

class FormUserTagController {

    async createNewTag(req, res) {
        const { tagName } = req.body;

        try {
            const transaction = await sequelize.transaction();
    
            const existingTag = await UsrTag.findOne({
                where: { tagName: { [Op.eq]: tagName } },
                attributes: ['id', 'tagName'],
                transaction,
            });
    
            if (existingTag) {
                throw new Error(`${tagName} already exists!`);
            }
    
            const userTag = await UsrTag.create(
                {
                    id: generateSecureID(),
                    tagName: tagName,
                },
                { transaction }
            );
            transaction.commit();
            console.log(userTag.get({plain: true}));

            return res.json({
                message: `${userTag.tagName} created successfully`,
                data: userTag.get({plain: true})
            });

        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadAddUsers(req, res) {
        try {
            const search = new UserTagSearch(req.query)
            // console.log(req.query);
            const users = await search.run(true)

            users.forEach(user => {
                user.value = user.userName;
                user.label = user.userName;
                if (req.query.tagId) {
                    user.tags.sort((a, b) => {
                        return b.isMatching - a.isMatching;
                    });
                }
                user.isDisabled = req.query.tagId && user.tags?.some(tag => tag.isMatching)
            })
            // console.log(users);
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
                        return b.isMatching - a.isMatching;
                    });
                }
                user.isDisabled = req.query.tagId && !user.tags?.some(tag => tag.isMatching)
            })

            // console.log(users);
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

        const addDate = new Date();

        try {
            for (const { tagId, tagName, users } of newTags) {

                try {
                    tag = await UsrTag.findByPk(tagId, { transaction }); // Ensure it's inside transaction
                    if (!tag) throw new Error()
                } catch (error) {
                    res.status(500).send(`No Matching User Type for ${tagName} Found!`);
                }
                
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
            res.status(500).send({ error: error.message });
        }
    };

    async delUserTag(req, res) {
        const removeTags = req.body.tags;
        const transaction = await sequelize.transaction(); // Start transaction

        const authId = req.auth.id;

        const delDate = new Date();

        try {
            for (const { users } of removeTags) {
                
                for (const { userTagId, remarks } of users) {
                    const delEventId = generateSecureID();

                    await Event.create({
                        id: delEventId,
                        eventDate: delDate,
                        adminId: authId,
                    }, { transaction: transaction });
            
                    if (remarks && remarks !== '') {
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
            // console.log("succcessful transaction");
            res.status(500).send({ error: error.message });
        }
    }
}

module.exports = new FormUserTagController();