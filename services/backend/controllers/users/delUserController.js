// TODO IMPT ALLOW DUPLICATE NAMES BUT UNIQUE ID! IMPT TODO

const { model } = require('mongoose');
const { sequelize, Vendor, Dept, Usr, UsrDelete, Event, Loan, AstLoan, AccLoan, AccReturn, Rmk } = require('../../models');
const { generateSecureID } = require('../../utils/nanoidValidation.js');
const FormHelpers = require('../formHelperController.js');
const { Op } = require('sequelize');
const { UserAvailable } = require('../../search_tools/userAvailable.js');


class DelUserController {

    async searchUsersDelete(req, res) {
        try {
            const search = new UserAvailable(req.query)
            const query = await search.run()

            const users = query.map(
                user => ({
                    ...user,
                    value: user.userName,
                    label: user.userName,
                    isDisabled: user.delEventId ? true : false
                })
            )
            
            res.json(users);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    // TODO loadUsrDel

    async _validateUserIsDeletable(userId, t) {
        const user = await Usr.findOne({
            where: { id: userId },
            include: [
                {
                    model: Dept,
                    attributes: ['deptName'],
                },
                {
                    model: Loan,
                    include: [
                        {
                            model: AstLoan,
                            include: {
                                model: AstReturn,
                                include: {
                                    model: Event,
                                    where: pendingOrCancelledEventCondition() // unreturned by user
                                },
                                required: true
                            },
                            required: false,
                        },
                        {
                            model: AccLoan,
                            include: {
                                model: AccReturn,
                                include: {
                                    model: Event,
                                    where: pendingOrCancelledEventCondition() // unreturned by user
                                },
                                required: true
                            },
                            required: false,
                        }
                    ]
                },
                {
                    model: Event,
                    attributes: ['id'],
                    where: { closedDate: { [Op.eq]: null } }, // scheduled
                    required: false,
                },
                {
                    model: AstDelete,
                    include: {
                        model: Event,
                        where: successfulEventCondition() // deleted user
                    },
                    required: false
                }
            ],
            transaction: t
        });

        return user;
    }

    async getDelUserIssues(req, res) {
        // check for added / scheduled / pending delete
        const { userIds } = req.body;

        const transaction = await sequelize.transaction();

        try {
            const users = await Promise.all(
                userIds.map(async (userId) => {
                    return this._validateUserIsDeletable(userId, transaction);
                })
            );

            if (!users || users.length === 0) return res.status(200)

            return res.status(500).json(users.reduce((issues, user) => {
                if (!issues[user.id]) {
                    issues[user.id] = []
                }
                issues[user.id] = {
                    deptName: user.Dept.deptName,
                    loans: user.Loans.map(loan => new LoanDTO(loan)),
                    AddEvent: user.AddEvent? user.AddEvent.get({plain: true}) : null,
                    DelEvents: user.DelEvents? user.DelEvents.map(delEvent => delEvent.get({plain: true})) : null,
                }
            }));
        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    // SECTION POST FORM SUBMISSION

    async _dbDel(users, adminId, closed) {

        const errors = {}

        try {
            const userIds = new Set()
            await sequelize.transaction(async (t) => {
                for (const { userId, userName, remarks, delDate } of users) {
                    if (userIds.has(userId)) {
                        throw new Error("Can't delete the same user!");
                    }
                    const user = await this._validateUserIsDeletable(userId, t);

                    if (!user) {
                        errors[userId] = `User ${userName} not found!`
                    }
                    
                    else if (user.UsrDeletes?.some(usrDelete => !usrDelete.Event.cancelled && usrDelete.Event.closedDate)) {
                        errors[userId] = `User ${userName} is already deleted!!`
                    }

                    else if (user.UsrDeletes?.some(usrDelete => usrDelete.Event.cancelled)) {
                        errors[userId] = `User ${userName} is already scheduled for deletion!!`
                    }
                    
                    else if (user.Loans && user.Loans.length > 0) {
                        errors[userId] = `User ${userName} still has items on loan!`
                    }

                    userIds.add(userId);

                    const delEventId = generateSecureID();

                    // Create the deletion event
                    const event = await Event.create(
                        {
                            id: delEventId,
                            openedDate: delDate,
                            openedAdminId: adminId,
                            ...(closed && {
                                closedDate: delDate,
                                closedAdminId: adminId
                            })
                        },
                        { transaction: t }
                    );

                    await UsrDelete.create({
                        userId: userId,
                        eventId: event.id
                    }, { transaction: t })
                    
                    // Add remarks if provided
                    if (remarks && remarks !== '') {
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
                }
            });

            if (errors.length > 0) throw new ValidationError(errors);
            console.log("Users deleted successfully");
        } catch (error) {
            console.error("Error during asset deletion:", error);
            throw error;
        }
    }
    
    async del (req, res) {
        const users = req.body.users;
        const adminId = req.auth.id;
    
        try {
            await this._dbDel(users, adminId, true)
            console.log("Users deleted successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during user deletion:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    async scheduleDel (req, res) {
        const users = req.body.users;
        const adminId = req.auth.id;
    
        try {
            await this._dbDel(users, adminId, false)
            console.log("Users scheduled for deletion successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during user deletion:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    // SECTION scheduled

    async _getPendingDelUsers(eventIds, transaction) {
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
    
    async cancelDeluser(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingDelUsers(eventIds, transaction);
    
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
            return res.status(200).json({ message: "User deletions successfully cancelled" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }

    async confirmDelUser(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingDelUsers(eventIds, transaction);
    
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
            return res.status(200).json({ message: "Users successfully deleted" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new DelUserController();