const { Ast, AstType, AstSType, Vendor, Usr, AstLoan, Sequelize, sequelize, Event, AccType, AccLoan, AccReturn, Loan, Admin, Rmk, AstTagMap, AstTag } = require('../../models/index.js');
const { Op } = require('sequelize');
const { createSelection, getAllOptions, getDistinctOptions } = require('../utils.js');
const logger = require('../../logging.js');
const AssetDTO = require('../../dtos/ast.dto.js');
const EventDTO = require('../../dtos/event.dto.js');
const { AssetTagSearch } = require('../../search_tools/AssetTag.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');

class AddAssetTagController {

    async loadAddAssets(req, res) {
        try {
            // console.log(req.query.tagId);
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
            // console.log(assets);
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

            // console.log(assets);
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    };

    async addAssetTag(req, res) {
        try {
            const { tags } = req.body;
            const authId = req.auth.id;
            await this._dbAdd(tags, authId)
            return res.json({ message: 'All tags added successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while adding the tags: ${error.message}`);
        }
    }

    async scheduleAddAssetTag(req, res) {
        try {
            const { tags, expectedDate } = req.body;
            const authId = req.auth.id;
            await this._dbAdd(tags, authId, expectedDate)
            return res.json({ message: 'All tags added successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while adding the tags: ${error.message}`);
        }
    }

    async _dbAdd(newTags, authId, expectedDate) {
        logger.info(newTags);
        const transaction = await sequelize.transaction(); // Start transaction

        const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

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
                        eventDate: curDate,
                        openedAdminId: authId,
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
                            remarkDate: curDate,
                            remarks: remarks,
                            adminId: authId
                        }, { transaction: transaction });
                    }

                    await AstTagMap.create({
                        id: generateSecureID(),
                        tagId: tag.id,
                        assetId: assetId,
                        eventId: addEventId,
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
}

module.exports = new AddAssetTagController();