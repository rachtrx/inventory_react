const { Ast, AstType, AstSType, Vendor, Usr, AstLoan, Sequelize, sequelize, Event, AccType, AccLoan, AccReturn, Loan, Admin, Rmk, AstTagMap, AstTag } = require('../models/index.js');
const { Op } = require('sequelize');
const { createSelection, getAllOptions, getDistinctOptions } = require('./utils.js');
const logger = require('../logging.js');
const AssetDTO = require('../dtos/ast.dto.js');
const EventDTO = require('../dtos/event.dto.js');
const { AssetTagSearch } = require('../search_tools/AssetTag.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');

class FormAssetTagController {

    async loadAddAssets(req, res) {
        try {
            console.log(req.query.tagId);
            const search = new AssetTagSearch(req.query)
            const assets = await search.run(true)

            assets.forEach(asset => {
                asset.value = asset.serialNumber;
                asset.label = asset.serialNumber;
                if (req.query.tagId) {
                    asset.tags.sort((a, b) => {
                        return b.tagId === req.query.tagId - a.tagId === req.query.tagId;
                    });
                }
                asset.isDisabled = req.query.tagId && asset.tags?.some(tag => tag.tagId === req.query.tagId)
            })
            console.log(assets);
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    };

    async loadDelAssets(req, res) {
        try {
            const search = new AssetTagSearch(req.query)
            const assets = await search.run(false)

            assets.forEach(asset => {
                asset.value = asset.serialNumber;
                asset.label = asset.serialNumber;
                if (req.query.tagId) {
                    asset.tags.sort((a, b) => {
                        return b.tagId === req.query.tagId - a.tagId === req.query.tagId;
                    });
                }
                asset.isDisabled = req.query.tagId && !asset.tags?.some(tag => tag.tagId === req.query.tagId)
            })

            console.log(assets);
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    };


    async addAssetTag(req, res) {
        const newTags = req.body.tags;
        logger.info(newTags);
        const transaction = await sequelize.transaction(); // Start transaction

        const authId = req.auth.id;

        const addDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

        try {
            for (const { tagId, tagName, assets } of newTags) {

                let tag;
                if (tagId && tagId !== '') {
                    tag = await AstTag.findByPk(tagId, { transaction }); // Ensure it's inside transaction
                } else {
                    tag = await AstTag.create({
                        id: generateSecureID(),
                        tagName: tagName
                    }, { transaction });
                }
                
                for (const { assetId, remarks, serialNumber } of assets) {

                    const tagExists = await AstTagMap.findOne({
                        where: {
                            tagId: tag.id,
                            assetId: assetId,
                            delEventId: { [Op.eq]: null }
                        },
                        transaction
                    })

                    if (tagExists) throw new Error(`Tag ${tagName} already exists for ${serialNumber}`)

                    const asset = await Ast.findOne({
                        where: {
                            id: assetId,
                            delEventId: { [Op.eq]: null }
                        },
                        transaction
                    });

                    if (!asset) {
                        throw new Error(`Asset with ID ${assetId} not found.`);
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

                    await AstTagMap.create({
                        id: generateSecureID(),
                        tagId: tag.id,
                        assetId: assetId,
                        addEventId: addEventId,
                    }, { transaction: transaction });
                }
            }

            await transaction.commit();
            return res.json({ message: 'All tags added successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while creating the tags: ${error.message}`);
        }
    };

    async delAssetTag(req, res) {
        const removeTags = req.body.tags;
        const transaction = await sequelize.transaction(); // Start transaction

        const authId = req.auth.id;

        const delDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

        try {
            for (const { assets } of removeTags) {
                
                for (const { assetTagId, remarks } of assets) {
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

                    await AstTagMap.update(
                        { 
                            delEventId: delEventId
                        },
                        { 
                            where: { id: assetTagId },
                            transaction: transaction
                        }
                    );
                }
            }
            
            await transaction.commit();
            return res.json({ message: 'All tags deleted successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while deleting the tags: ${error.message}`);
        }
    }
}

module.exports = new FormAssetTagController();