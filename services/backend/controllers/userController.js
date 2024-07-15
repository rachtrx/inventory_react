const { sequelize, Sequelize, Vendor, Dept, User, AssetType, AssetTypeVariant, Asset, Event } = require('../models');
const { Op } = Sequelize;

const logger = require('../logging')

// exports.getFilters = async (req, res) => {
//     try {

//         const [depts, assetCounts] = await Promise.all([
//             Dept.findAll({
//                 attributes: [[sequelize.fn('DISTINCT', sequelize.col('dept_name')), 'deptName']],
//                 raw: true
//             }),
//             User.findAll({
//                 include: [{
//                     model: Asset,
//                     attributes: [],
//                     where: { 
//                         status: { [Op.ne]: 'condemned' } 
//                     }
//                 }],
//                 attributes: [
//                     'id',
//                     [sequelize.fn('COUNT', sequelize.col('Assets.id')), 'assetCount']
//                 ],
//                 group: ['User.id']
//             }).then(users => {
//                 // Calculate age for each asset and include it in the results
//                 return users.reduce((assetCounts, user) => {

//                     const assetCount = user.assetCount;
                  
//                   // Check if age already exists in the ages array
//                   if (!assetCounts.some(existingAssetCount => existingAssetCount.assetCount === assetCount)) {
//                     assetCounts.push({ assetCount });
//                   }
                
//                   return assetCounts;
//                 }, []);
//             })
//         ])

//         const filters = {
//             depts: depts.map(dept => dept.deptName),
//             assetCount: assetCounts.map(assetCount => assetCount.count)
//         }
//         logger.info(`User Filters: ${filters}`);
//         res.json(filters);
//     } catch (error) {
//         console.error('Error fetching filters:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };

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

// // function takes an array of users and filters them based on whether they already have a device
// const combinedUsers = function(usersArray) {
//     return usersArray.reduce((users, user) => {
//         // existingUser will return the user if found
//         const existingUser = users.find((filteredUser) => filteredUser.userId === user.userId);
//         if (existingUser) {
//             // User already exists, add the device details to the existing user's users array
//             existingUser.devices.push(user.device);
//             existingUser.deviceCount = user.device ? existingUser.deviceCount++ : existingUser.deviceCount
//         } else {
//             // TODO check on the count
//             // Create a new user object with the device details
//             const newUser = {
//                 userId: user.userId,
//                 userName: user.userName,
//                 deptName: user.deptName,
//                 bookmarked: user.bookmarked || 0,
//                 hasResigned: user.hasResigned || 0,
//                 ...(user.device && {devices: [user.device]}),
//                 deviceCount: user.device ? 1 : 0,
//             }
//             users.push(newUser);
//         }
//         return users;
//     }, []);
// }