const { sequelize, Vendor, Dept, User, AssetType, AssetTypeVariant, Asset, Event } = require('../models');
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

exports.searchAssets = async (req, res) => {
    const { data, first } = req.body;
    const assetTag = '%' + data + '%';
    try {
        const results = await Asset.findAll({
            include: [{
                model: AssetTypeVariant,
                required: true,
                attributes: ['variantName']
            }],
            where: {
                assetTag: {
                    [sequelize.Op.iLike]: assetTag
                }
            },
            order: [
                sequelize.literal(`status = ${first} DESC`)
            ],
            limit: 20,
            attributes: ['assetTag', 'serialNumber', 'id', 'status']
        });
        const assets = results.map(asset => asset.get({ plain: true }));
        res.json(assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.searchUsers = async (req, res) => {
    const { data, isAsc } = req.body;
    const userName = '%' + data + '%';
    try {
        const results = await User.findAll({
            include: [{
                model: Asset,
                attributes: ['id', 'assetTag', 'bookmarked'],
                include: [{
                    model: AssetTypeVariant,
                    attributes: ['variantName']
                }]
            }, {
                model: Dept,
                required: true,
                attributes: ['deptName']
            }],
            where: {
                userName: {
                    [sequelize.Op.iLike]: userName
                }
            },
            order: [
                ['hasResigned', 'ASC'],
                [sequelize.fn('count', sequelize.col('Device.assetTag')), 'ASC'],
                [isAsc ? 'created_date' : 'created_date', isAsc ? 'ASC' : 'DESC']
            ],
            group: ['User.id', 'Dept.deptName', 'Device.id', 'AssetTypeVariant.variantName'],
            attributes: ['id', 'userName', 'bookmarked', 'hasResigned'],
            limit: 20
        });
        const users = results.map(user => user.get({ plain: true }));
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
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
                model: Dept,
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