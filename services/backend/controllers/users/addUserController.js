// TODO IMPT ALLOW DUPLICATE NAMES BUT UNIQUE ID! IMPT TODO

const { model } = require('mongoose');
const { sequelize, Vendor, Dept, Usr, AstType, AstSType, Ast, Event, Loan, AstLoan, AccLoan, AccReturn, Rmk } = require('../../models');
const { generateSecureID } = require('../../utils/nanoidValidation.js');
const FormHelpers = require('../formHelperController.js');
const { Op } = require('sequelize');


class AddUserController {

    async _validateUserIsAddable(userName, t) {
        const assets = await Usr.findAll({
            where: { userName: userName },
            attributes: ['userName'],
            include: [
                {
                    model: Dept,
                    attributes: ['deptName'],
                },
                {
                    model: Event, // scheduled to add / added
                    attributes: ['id'],
                    required: false,
                },
                {
                    model: UsrDelete, // scheduled to delete
                    include: {
                        model: Event,
                        required: false,
                    },
                }
            ],
            transaction: t,
        })
        return assets;
    }

    async createNewDept(req, res) { // TODO reload filters on frontend after created
        const { deptName } = req.body;

        try {
            const transaction = await sequelize.transaction();
    
            const existingDeptName = await Dept.findOne({
                where: { deptName: { [Op.eq]: deptName } },
                attributes: ['id', 'deptName'],
                transaction,
            });
    
            if (existingDeptName) {
                throw new Error(`${deptName} already exists!`);
            }
    
            const dept = await Dept.create(
                {
                    id: generateSecureID(),
                    deptName: deptName,
                },
                { transaction }
            );
            transaction.commit();

            return res.json(dept.get({plain: true}));

        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    async getAddUserIssues(req, res) {
        // check for added / scheduled / pending delete
        const { userNames } = req.body;

        const transaction = await sequelize.transaction();

        try {
            const users = await Promise.all(userNames.map(async userName => {
                await this._validateUserIsAddable(userName, transaction)
            }))

            if (!users || users.length === 0) return res.status(200)

            return res.status(500).json(users.reduce((issues, user) => {
                if (!issues[user.userName]) {
                    issues[user.userName] = []
                }
                issues[user.userName].push({
                    deptName: user.Dept.deptName,
                    AddEvent: user.AddEvent? user.AddEvent.get({plain: true}) : null,
                    DelEvents: user.DelEvents? user.DelEvents.map(delEvent => delEvent.get({plain: true})) : null,
                })
            }));
        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    async _dbAdd(depts, adminId, closed) {
        try {
            await sequelize.transaction(async (t) => {
                await Promise.all(
                    depts.map(async ({deptId, deptName, users}) => {
                        const userDeptId = deptId || generateSecureID();
            
                        // Check if the department exists or needs to be created
                        if (!deptId) {
                            throw new Error(`Dept not found for ${deptName}`);
                        }

                        const conflictingUsers = await Promise.all(
                            users.map(async user => await this._validateUserIsAddable(user.userName, t))
                        )

                        const conflictingUser = conflictingUsers.some(conflictingUser => conflictingUser.Dept.id === deptId)
                        if (conflictingUser) {
                            throw new Error(`Asset ${conflictingUser.userName} already exists under department ${conflictingUser.Dept.deptName}`);
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
                                        openedDate: addDate,
                                        openedAdminId: adminId,
                                        ...(closed && {
                                            closedDate: addDate,
                                            closedAdminId: adminId,
                                        })
                                    },
                                    { transaction: t }
                                );
    
                                if (remarks && remarks !== '') {
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
                                        bookmarked: bookmarked || 0,
                                        addEventId: addEventId,
                                    },
                                    { transaction: t }
                                );
                            })
                        );
                    })
                );
            });
        } catch (error) {
            logger.info(error);
            throw error;
        }
    }
    
    async add (req, res) {
        const adminId = req.auth.id;
        const { depts } = req.body;
    
        try {

            await this._dbAdd(depts, adminId, true)
            console.log("Users created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during user creation:", error);
            return res.status(400).json({ error: error.message });
        }        
    };

    async scheduleAdd(req, res) {
        const adminId = req.auth.id;
        const { depts } = req.body;
    
        try {
            await this._dbAdd(depts, adminId, false);
            console.log("Users add scheduled successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during user creation:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    // SECTION confirm / cancel
    async _getPendingAddUsers(eventIds, transaction) {
        const pendingEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.in]: eventIds } },
                    { closedDate: { [Op.eq]: null } }
                ]
            },
            include: [{
                model: Usr,
                attributes: ['userName'],
                required: true,
            }],
            transaction
        });

        if (pendingEvents.length === 0) {
            throw new Error("No valid pending events found.");
        }

        return pendingEvents;
    }

    async cancelAddUser(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingAddUsers(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.Usr) {
                    throw new Error(`User not found for event ID ${pendingEvent.id}`);
                }
    
                await pendingEvent.update(
                    {
                        closedDate: new Date(),
                        cancelled: true
                    },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "Users successfully cancelled" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }

    async confirmAddUser(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingAddUsers(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.Usr) {
                    throw new Error(`User not found for event ID ${pendingEvent.id}`);
                }
    
                await pendingEvent.update(
                    { closedDate: new Date() },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "Users successfully confirmed" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AddUserController();