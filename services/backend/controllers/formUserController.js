// TODO IMPT ALLOW DUPLICATE NAMES BUT UNIQUE ID! IMPT TODO

const { model } = require('mongoose');
const { sequelize, Vendor, Dept, Usr, AstType, AstSType, Ast, Event, Loan, AstLoan, AccLoan, AccReturn, Rmk, Sequelize } = require('../models');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const { Op } = require('sequelize');
const { UserDelete } = require('../search_tools/userDelete.js');
const logger = require('../logging.js');


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

    async createNewDept(req, res) {
        const { deptName } = req.body;

        try {
            const transaction = await sequelize.transaction();
    
            const existingTag = await Dept.findOne({
                where: { deptName: { [Op.eq]: deptName } },
                attributes: ['id', 'deptName'],
                transaction,
            });
    
            if (existingTag) {
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
            console.log(dept.get({plain: true}));

            return res.json({
                message: `${dept.deptName} created successfully`,
                newDept: dept.get({plain: true})
            });

        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }
    
    async add (req, res) {
        const adminId = req.auth.id;
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
                                        eventDate: addDate,
                                        adminId: adminId,
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
        
            console.log("Users created successfully");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during user creation:", error);
            return res.status(400).json({ error: error.message });
        }        
    };
    
    // When Does Sequelize Use include.where in ON Instead of WHERE?
    // Sequelize places include.where inside ON only if:

    // 1. The required option is false (i.e., LEFT JOIN).
    // 2. The condition applies only to the joined table and doesn’t reference the main table.
    // 3. The condition isn’t wrapped inside Op.or, Op.and, or another conditional structure.
    async del (req, res) {
        const users = req.body.users;
        const adminId = req.auth.id;
    
        try {
            const userIds = new Set()
            await sequelize.transaction(async (t) => {
                for (const { userId, userName, remarks, delDate } of users) {
                    if (userIds.has(userId)) {
                        throw new Error("Can't delete the same user!");
                    }
                    const user = await Usr.findByPk(userId, { 
                        attributes: ['id', 'delEventId'],
                        // logging: console.log,
                        include: {
                            model: Loan,
                            required: false,
                            include: [
                                {
                                    model: AstLoan,
                                    where: { returnEventId: { [Op.eq]: null } },
                                    required: false
                                },
                                {
                                    model: AccLoan,
                                    where: Sequelize.literal(`
                                        NOT EXISTS (
                                            SELECT 1
                                            FROM "acc_returns" AS "AccReturns"
                                            WHERE "AccReturns"."acc_loan_id" = "Loans->AccLoans"."id"
                                            GROUP BY "Loans->AccLoans"."id"
                                            HAVING COALESCE(SUM("AccReturns"."count"), 0) = "Loans->AccLoans"."count" -- Not exists all returned yet
                                        )
                                    `),
                                    // include: {
                                    //     model: AccReturn,
                                    //     where: { returnEventId: { [Op.ne]: null } },
                                    //     required: true
                                    // },
                                    required: false
                                },
                            ]
                        },
                        transaction: t
                    });

                    logger.info(user.get({plain: true}));
        
                    if (!user) {
                      throw new Error(`Usr Name ${userName} doesn't exist!`);
                    }
                    if (user.delEventId) {
                        throw new Error("Usr has already been removed!");
                    }
                    if (user.Loans?.some(loan => loan.AstLoan || loan.AccLoans?.length)) throw new Error(`User ${userName} still has items on loan!`);

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
            console.error("Error during user deletion:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    async loadUsrDel (req, res) {
        try {
            const search = new UserDelete(req.query)
            const query = await search.run()

            const users = query.map(
                user => ({
                        ...user,
                        value: user.userName,
                        label: user.userName,
                        isDisabled: user.delEventId || user.loans.length > 1 || user.reservations.length > 1
                })
            )
            // console.log(users);
            res.json(users);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new FormUserController();