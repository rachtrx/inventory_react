// TODO IMPT ALLOW DUPLICATE NAMES BUT UNIQUE ID! IMPT TODO

const { sequelize, Vendor, Dept, Usr, AstType, AstSType, Ast, Event } = require('../models');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const FormHelpers = require('./formHelperController.js');


class FormUserController {

    async getDepts(req, res) {
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
    
    async add (req, res) {
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
                        throw new Error(`Dept ${deptName} already exists!`);
                    }
    
                    deptId = generateSecureID();
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
                        throw new Error(`Dept ${deptName} not found!`);
                    }
    
                    deptId = existingDept.id;
                }
    
                // Process each user # TODO set of ID and username combined?
                for (const user of users) {
                    const { userName, remarks } = user;
                    const userNameLower = userName.toLowerCase();
                    const existingUser = await Usr.findOne({
                        where: { userName: { [Op.iLike]: userNameLower } },
                        transaction: t
                    });
    
                    if (existingUser) {
                        throw new Error(`Usr Name ${userName} already exists or is duplicated in the request!`);
                    }
    
                    const userId = generateSecureID();
                    await Usr.create({
                        id: userId,
                        userName: userName,
                        deptId: deptId,
                        bookmarked: false,
                        deletedDate: null
                    }, { transaction: t });
    
                    const id = generateSecureID();
                    const eventType = 'created';
                    await FormHelpers.insertUserEvent(id, eventType, userId, remarks, t);
                }
            });
    
            console.log("Users created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during user creation:", error);
            return res.status(400).json({ error: error.message });
        }
    };
    
    async remove (req, res) {
        const users = req.body.users;
    
        try {
            const userIds = new Set()
            await sequelize.transaction(async (t) => {
                for (const { userId, userName, remarks } of users) {
                    if (userIds.has(userId)) {
                        throw new Error("Can't delete the same user!");
                    }
                    const user = await Usr.findByPk(userId, { 
                        attributes: ['deletedDate'],
                        transaction: transaction
                    });
        
                    if (!user) {
                      throw new Error(`Usr Name ${userName} doesn't exist!`);
                    }
                    if (user.deletedDate) {
                        throw new Error("Usr has already been removed!");
                    }
                    const userDevice = await Ast.findOne({
                        where: { userId: userId },
                        transaction: t
                    });
                    if (userDevice) {
                        throw new Error(`${userDevice.assetTag} is still being loaned by the user!`);
                    }
                    userIds.add(userId);
            
                    await insertUserEvent(generateSecureID(), 'removed', userId, remarks, t);
                    await Usr.update({ deletedDate: 1 }, { // TODO UPDATE!
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
}

module.exports = new FormUserController();