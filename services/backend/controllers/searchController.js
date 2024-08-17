const { sequelize, Vendor, Department, User, AssetType, AssetTypeVariant, Asset, Event } = require('../models/postgres');
const uuid = require('uuid');

exports.searchVariants = async (req, res) => {
    const data = req.body;
    const variantName = '%' + data + '%';
    try {
        const results = await AssetTypeVariant.findAll({
            include: [{
                model: AssetType,
                required: true,
                attributes: ['assetType'],
            }],
            where: {
                variantName: {
                    [sequelize.Op.iLike]: variantName
                }
            },
            order: [
                ['createdAt', 'ASC']
            ],
            limit: 20,
            attributes: ['id', 'variantName']
        });
        console.log(results);
        const models = results.map(result => result.get({ plain: true }));
        res.json(models);
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.searchUser = async (req, res) => {
    const { assetId } = req.body;
    try {
        const user = await User.findAll({
            include: [{
                model: Asset,
                required: true,
                attributes: ['id'],
                where: { id: assetId }
            }, {
                model: Department,
                required: true,
                attributes: ['deptName']
            }],
            attributes: ['id', 'userName']
        });
        const event = await Event.findOne({
            where: {
                eventType: 'loaned',
                assetId: assetId
            },
            order: [
                ['eventDate', 'DESC']
            ],
            attributes: ['id', 'filePath']
        });
        const response = {
            user: user.map(u => u.get({ plain: true })),
            event: event ? event.get({ plain: true }) : {}
        };
        res.json(response);
    } catch (error) {
        console.error('Error fetching user and event:', error);
        res.status(500).send('Internal Server Error');
    }
};