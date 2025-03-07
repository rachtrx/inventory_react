const { Ast, AstType, AstSType, Vendor, Usr, AstLoan, Sequelize, sequelize, Event, AccType, AccLoan, AccReturn, Loan, Admin, Rmk, AstTagMap, AstTag, AstTagMapDel } = require('../../models/index.js');
const { Op } = require('sequelize');
const { createSelection, getAllOptions, getDistinctOptions } = require('../utils.js');
const logger = require('../../logging.js');
const AssetDTO = require('../../dtos/ast.dto.js');
const EventDTO = require('../../dtos/event.dto.js');
const { AssetTagSearch } = require('../../search_tools/AssetTag.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');

class DelAssetTagController {

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

    async delAssetTag(req, res) {
        try {
            const { tags } = req.body;
            const authId = req.auth.id;
            await this._dbDel(tags, authId)
            return res.json({ message: 'All tags deleted successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while deleting the tags: ${error.message}`);
        }
    }

    async scheduleDelAssetTag(req, res) {
        try {
            const { tags, expectedDate } = req.body;
            const authId = req.auth.id;
            await this._dbDel(tags, authId, expectedDate)
            return res.json({ message: 'All tags scheduled for deletion successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send(`An error occurred while deleting the tags: ${error.message}`);
        }
    }

    async _dbDel(removeTags, authId, expectedDate=null) {
        const transaction = await sequelize.transaction(); // Start transaction
        const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

        try {
            for (const { assets } of removeTags) {
                
                for (const { assetTagId, remarks } of assets) {
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

                    await AstTagMapDel.create({
                        id: generateSecureID(),
                        astTagMapId: assetTagId,
                        eventId: delEventId,
                        transaction: transaction
                    })
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

module.exports = new DelAssetTagController();