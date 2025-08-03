const { Ast, sequelize, Event, Rmk, AstTagMap, AstTag } = require('@models');
const { Op } = require('sequelize');
const logger = require('@utils/logging.js');
const { AssetTagSearch } = require('@services/search/asset/assetTag.js');
const { generateSecureID } = require('@utils/validation.js');

class FormAssetTagController {

    async createNewTag(req, res) {
        const { tagName } = req.body;

        try {
            const transaction = await sequelize.transaction();
    
            const existingTag = await AstTag.findOne({
                where: { tagName: { [Op.eq]: tagName } },
                attributes: ['id', 'tagName'],
                transaction,
            });
    
            if (existingTag) {
                throw new Error(`${tagName} already exists!`);
            }
    
            const assetTag = await AstTag.create(
                {
                    id: generateSecureID(),
                    tagName: tagName,
                },
                { transaction }
            );
            transaction.commit();
            console.log(assetTag.get({plain: true}));

            return res.json({
                message: `${assetTag.tagName} created successfully`,
                data: assetTag.get({plain: true})
            });

        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadAddAssets(req, res) {
        try {
            // console.log(req.query.tagId);
            const search = new AssetTagSearch({...req.query, isAdd: true})
            const assets = await search.run(true)

            assets.forEach(asset => {
                asset.value = asset.serialNumber;
                asset.label = asset.serialNumber;
                if (req.query.tagId) {
                    asset.tags.sort((a, b) => {
                        return b.isMatching - a.isMatching;
                    });
                }
                // IMPT allow deleted assets to be tagged
                // asset.isDisabled = req.query.tagId && asset.tags?.some(tag => tag.isMatching)
            })
            // console.log(assets);
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Assets to tag:', error)
            return res.status(500).json({ error: error.message });
        }
    };

    async loadDelAssets(req, res) {
        try {
            const search = new AssetTagSearch({...req.query, isAdd: false})
            const assets = await search.run(false)

            assets.forEach(asset => {
                asset.value = asset.serialNumber;
                asset.label = asset.serialNumber;
                if (req.query.tagId) {
                    asset.tags.sort((a, b) => {
                        return b.isMatching - a.isMatching;
                    });
                }
                asset.isDisabled = req.query.tagId && !asset.tags?.some(tag => tag.isMatching)
            })

            // console.log(assets);
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Assets to del tag:', error)
            return res.status(500).json({ error: error.message });
        }
    };


    async addAssetTag(req, res) {
        const newTags = req.body.tags;
        logger.info(newTags);
        const transaction = await sequelize.transaction(); // Start transaction

        const authId = req.auth.id;

        const addDate = new Date();

        try {
            for (const { tagId, tagName, assets } of newTags) {

                let tag;

                try {
                    tag = await AstTag.findByPk(tagId, { transaction }); // Ensure it's inside transaction
                    if (!tag) throw new Error()
                } catch (error) {
                    res.status(500).json({message: `No Matching Asset Type for ${tagName} Found!`});
                    return;
                }
                
                for (const { assetId, remarks, serialNumber } of assets) {

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
            
                    if (remarks && remarks !== '') {
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
            res.status(500).send({ error: error.message });
        }
    };

    async delAssetTag(req, res) {
        const removeTags = req.body.tags;
        const transaction = await sequelize.transaction(); // Start transaction

        const authId = req.auth.id;

        const delDate = new Date();

        try {
            for (const { tagId, assets } of removeTags) {
                
                for (const { assetId, remarks } of assets) {
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

                    await AstTagMap.update(
                        { 
                            delEventId: delEventId
                        },
                        { 
                            where: { 
                                assetId,
                                tagId,
                                delEventId: { [Op.eq]: null }
                            },
                            transaction: transaction
                        }
                    );
                }
            }
            
            await transaction.commit();
            return res.json({ message: 'All tags deleted successfully.' });
        } catch (error) {
            logger.error(error);
            res.status(500).send({ error: error.message });
        }
    }
}

module.exports = new FormAssetTagController();