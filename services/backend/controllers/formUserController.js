// TODO IMPT ALLOW DUPLICATE NAMES BUT UNIQUE ID! IMPT TODO

const { sequelize, Vendor, Dept, User, AssetType, AssetTypeVariant, Asset, Event } = require('../models/postgres');
const uuid = require('uuid');
const FormHelpers = require('./formHelperController');

exports.getDepts = async (req, res) => {
    try {
        const depts = await Dept.findAll({
            order: [['deptName', 'ASC']],
            attributes: ['deptName']
        });
        const deptNames = depts.map(dept => dept.deptName);
        res.json(deptNames)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUser = async (req, res) => {
    const { deptName, users, isNewDept } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            let deptId;

            // Check if the deptName is new or existing
            if (isNewDept) {
                const existingDept = await Dept.findOne({
                    where: { deptName: { [Op.iLike]: deptName } },
                    transaction: t
                });

                if (existingDept) {
                    throw new Error(`Department ${deptName} already exists!`);
                }

                deptId = uuid.v4();
                await Dept.create({
                    id: deptId,
                    deptName: trimmedDept
                }, { transaction: t });
            } else {
                const deptLower = deptName.toLowerCase();
                const existingDept = await Dept.findOne({
                    where: { deptName: { [Op.iLike]: deptLower } },
                    attributes: ['id'],
                    transaction: t
                });

                if (!existingDept) {
                    throw new Error(`Department ${deptName} not found!`);
                }

                deptId = existingDept.id;
            }

            // Process each user # TODO set of ID and username combined?
            for (const user of users) {
                const { userName, remarks } = user;
                const userNameLower = userName.toLowerCase();
                const existingUser = await User.findOne({
                    where: { userName: { [Op.iLike]: userNameLower } },
                    transaction: t
                });

                if (existingUser) {
                    throw new Error(`User Name ${userName} already exists or is duplicated in the request!`);
                }

                const userId = uuid.v4();
                await User.create({
                    id: userId,
                    userName: userName,
                    deptId: deptId,
                    bookmarked: false,
                    deletedDate: null
                }, { transaction: t });

                const eventId = uuid.v4();
                const eventType = 'created';
                await FormHelpers.insertUserEvent(eventId, eventType, userId, remarks, t);
            }
        });

        console.log("Users created successfully");
        return res.sendStatus(200);
    } catch (error) {
        console.error("Error during user creation:", error);
        return res.status(400).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const users = req.body.users;

    try {
        const userIds = new Set()
        await sequelize.transaction(async (t) => {
            for (const { userId, userName, remarks } of users) {
                if (userIds.has(userId)) {
                    throw new Error("Can't delete the same user!");
                }
                const user = await User.findByPk(userId, { 
                    attributes: ['deletedDate'],
                    transaction: transaction
                });
    
                if (!user) {
                  throw new Error(`User Name ${userName} doesn't exist!`);
                }
                if (user.deletedDate) {
                    throw new Error("User has already been removed!");
                }
                const userDevice = await Asset.findOne({
                    where: { userId: userId },
                    transaction: t
                });
                if (userDevice) {
                    throw new Error(`${userDevice.assetTag} is still being loaned by the user!`);
                }
                userIds.add(userId);
        
                await insertUserEvent(uuid.v4(), 'removed', userId, remarks, t);
                await User.update({ deletedDate: 1 }, { // TODO UPDATE!
                    where: { id: userId },
                    transaction: t
                });
            }
        });
    
        console.log("Users deleted successfully");
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};