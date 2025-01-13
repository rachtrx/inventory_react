// TODO IMPT ALLOW DUPLICATE NAMES BUT UNIQUE ID! IMPT TODO

const { model } = require('mongoose');
const { sequelize, Vendor, Dept, Usr, AstType, AstSType, Ast, Event, UsrLoan, Loan, AstLoan, AccLoan, AccReturn } = require('../models');
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
        const { depts } = req.body;
    
        try {
            await sequelize.transaction(async (t) => {
                await Promise.all(
                    depts.map(async ({deptId, deptName, users}) => {
                        const userDeptId = deptId || generateSecureID();
            
                        // Check if the department exists or needs to be created
                        if (!deptId) {
                            const existingDept = await Dept.findOne({
                                where: { deptName: { [Op.iLike]: deptName } },
                                transaction: t,
                            });
                
                            if (existingDept) {
                                throw new Error(`Dept ${deptName} already exists!`);
                            }

                            await Dept.create(
                                {
                                    id: userDeptId,
                                    deptName: deptName.trim(),
                                },
                                { transaction: t }
                            );
                        }
                
                        // Process users concurrently with Promise.all
                        await Promise.all(
                            users.map(async ({ userName, bookmarked, addDate, remarks }) => {
                
                                // Check if the user already exists
                                const existingUser = await Usr.findOne({
                                    where: { userName: { [Op.iLike]: userName.toLowerCase() } },
                                    include: {
                                        model: Dept,
                                        attributes: ["deptName"]
                                    },
                                    transaction: t,
                                });
                
                                if (existingUser) {
                                    throw new Error(`User ${userName} has duplicates in ${existingUser.Dept.deptName}!`);
                                }

                                const addEventId = generateSecureID();

                                await Event.create(
                                    {
                                        id: addEventId,
                                        eventDate: rest.addDate,
                                        adminId: adminId,
                                    },
                                    { transaction: t }
                                );
    
                                if (remarks) {
                                    await Rmk.create(
                                        {
                                            id: generateSecureID(),
                                            eventId: addEventId,
                                            text: remarks,
                                            remarkDate: addDate,
                                            adminId: adminId,
                                        },
                                        { transaction: t }
                                    );
                                }

                                // Create the user
                                await Usr.create(
                                    {
                                        id: generateSecureID(),
                                        userName: userName,
                                        deptId: userDeptId,
                                        bookmarked: bookmarked || false,
                                        addEventId: addEventId,
                                    },
                                    { transaction: t }
                                );
                            })
                        );
                    })
                );
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
                for (const { userId, userName, remarks, delDate } of users) {
                    if (userIds.has(userId)) {
                        throw new Error("Can't delete the same user!");
                    }
                    const user = await Usr.findByPk(userId, { 
                        attributes: ['deletedDate'],
                        include: {
                            model: UsrLoan,
                            required: false,
                            include: {
                                model: Loan,
                                required: true,
                                include: [
                                    {
                                        model: AstLoan,
                                        where: { returnEventId: { [Op.ne]: null } },
                                        required: false
                                    },
                                    {
                                        model: AccLoan,
                                        include: {
                                            model: AccReturn,
                                            where: { returnEventId: { [Op.ne]: null } },
                                            required: true
                                        },
                                        required: false
                                    },
                                ]
                            },
                        },
                        transaction: transaction
                    });
        
                    if (!user) {
                      throw new Error(`Usr Name ${userName} doesn't exist!`);
                    }
                    if (user.delEventId) {
                        throw new Error("Usr has already been removed!");
                    }
                    if (user.UsrLoans && user.UsrLoans.length > 0) throw new Error(`User ${userName} still has items on loan!`);

                    userIds.add(userId);

                    const delEventId = generateSecureID();
            
                    // Create the deletion event
                    await Event.create(
                        {
                            id: delEventId,
                            eventDate: delDate,
                            adminId: adminId,
                        },
                        { transaction: t }
                    );
                    
                    // Add remarks if provided
                    if (remarks) {
                        await Rmk.create(
                            {
                                id: generateSecureID(),
                                eventId: delEventId,
                                text: remarks,
                                remarkDate: delDate,
                                adminId: adminId,
                            },
                            { transaction: t }
                        );
                    }
                    
                    // Update the asset with the delEventId and save it
                    await user.update(
                        { delEventId: delEventId },
                        { transaction: t }
                    );
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