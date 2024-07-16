const { sequelize, Sequelize, Vendor, Dept, User, AssetType, AssetTypeVariant, Asset, Event } = require('../models');

const logger = require('../logging')

const createUserObject = function(user) {
    return {
        id: user.id,
        name: user.userName,
        department: user.Dept.deptName,
        bookmarked: user.bookmarked,
        hasResigned: user.has_resigned || 0,
				registeredDate: user.registeredDate,
				assetCount: user.Assets.length,
        ...(user.Assets.length > 0 && {
					assets: user.Assets.map((asset) => ({
						assetTag: asset.assetTag,
						variant: asset.AssetTypeVariant.variantName,
						id: asset.id,
						bookmarked: asset.bookmarked || 0,
					}))
				}),
    }
}

exports.getUsers = async (req, res) => {
    try {
        const usersExist = await User.count();
        
        if (usersExist === 0) {
            return res.json([]);
        }

        const query = await User.findAll({
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
						hasResigned: { [Sequelize.Op.ne]: 1 }
					},
					order: [['registeredDate', 'DESC']],
					attributes: ['id', 'userName', 'bookmarked', 'hasResigned', 'registeredDate']
				});
				
				// Mapping over the result to modify each user object
				const result = query.map(user => {
					let plainUser = user.get({ plain: true });
					plainUser = createUserObject(plainUser);
					return plainUser;
				});

        logger.info(result.slice(10, 20));
        res.json(result);
    } catch (error) {
        console.error('Error fetching user views:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.bookmarkUser = async (req, res) => {
    const { userId, action } = req.body;
    try {
        const user = await User.findByPk(userId);
        if (user) {
            user.bookmarked = action === 'add' ? 1 : 0;
            await user.save();
            res.json({ message: "Bookmark updated successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.showUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const details = await User.findByPk(userId, {
            include: [{
                model: Dept,
                attributes: ['deptName']
            }],
            attributes: ['id', 'userName', 'bookmarked', 'hasResigned']
        });

        const events = await Event.findAll({
            where: { userId: userId },
            include: [{
                model: Asset,
                attributes: ['assetTag']
            }],
            attributes: ['id', 'eventType', 'assetId', 'eventDate', 'remarks', 'filepath'],
            order: [['eventDate', 'DESC']]
        });

        const pastDevices = await Asset.findAll({ // TODO SPLIT ENDPOINTS?
            include: [{
                model: Event,
                where: { userId: userId, eventType: 'returned' },
                attributes: []
            }, {
                model: AssetTypeVariant,
                attributes: ['variantName']
            }],
            where: { userId: userId }, 
            order: [[sequelize.col('Event.eventDate'), 'DESC']],
            attributes: ['id', 'serial_number', 'assetTag', 'bookmarked']
        });

        const currentDevices = await Asset.findAll({
            include: [{
                model: AssetTypeVariant,
                attributes: ['variantName']
            }],
            where: { userId: userId, status: 'loaned' },
            attributes: ['id', 'serial_number', 'assetTag', 'bookmarked']
        });

        res.json({
            details: details ? details.get({ plain: true }) : null,
            events: events.map(event => event.get({ plain: true })),
            pastDevices: pastDevices.map(device => device.get({ plain: true })),
            currentDevices: currentDevices.map(device => device.get({ plain: true }))
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
};
