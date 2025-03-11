const { Rmk, Admin, Ast, AccTxn, AccType, Usr, Loan, AstLoan, AccReturn, AccLoan, Event, Dept, AstSType, AstType, sequelize, AstTagMap, AstTag, UsrTagMap, UsrTag } = require("../models");
const logger = require('../logging.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const EventLogDTO = require("../dtos/eventLog.dto");
const { getAllOptions, getUserFilters, getAssetFilters, assetFilters, userFilters } = require("./utils.js");

class EventController {

    constructor() {
        this.fixedFields = ['adminId', 'eventDate', 'id']
        this.userFields = ["deptName", "userTag"]
        this.assetFields = ["typeName", "subTypeName", "assetTag"]
    }

    async addRemark(req, res) {
        try {
            const t = await sequelize.transaction();

            const {eventId, remark, dateTime} = req.body;
            const adminId = req.auth.id;

            if (remark && remark !== "") {
                await Rmk.create(
                    {
                        id: generateSecureID(),
                        eventId: eventId,
                        text: remark,
                        remarkDate: dateTime,
                        adminId: adminId,
                    },
                    { transaction: t }
                );
            } else {
                throw new Error("Remark is required");
            }
            await t.commit();
            return res.json({ message: 'Remark added successfully.' });
        } catch (err) {
            logger.error(err)
            console.error("Remark failed to add:", err);
            return res.status(400).json({ error: err.message });
        }   
    }

    async getFilters(req, res) {
        const { field } = req.body;

        let options;
        try {
            if (this.userFields.includes(field)) options = await getUserFilters(field);
            else if (this.assetFields.includes(field)) options = await getAssetFilters(field);
            else if (field === 'admin') {
                const meta = [Admin, 'adminName', 'id'];
                options = await getAllOptions(meta);
            } else throw new Error(`Unknown filtering field detected: ${field}`);
            return res.json(options || [])
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAllFilters(req, res) {
        try {
            const assetOptionsDict = Object.fromEntries(
                await Promise.all(
                    this.assetFields.map(async (field) => [field, await getAssetFilters(field)])
                )
            );
            const userOptionsDict = Object.fromEntries(
                await Promise.all(
                    this.assetFields.map(async (field) => [field, await getAssetFilters(field)])
                )
            );
            const meta = [Admin, 'adminName', 'id'];
            options = await getAllOptions(meta);
            return res.json({...assetOptionsDict, ...userOptionsDict, admin: options})
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAllEvents(req, res) {

        const filters = req.params.filters;
        
        try {    
            const eventRows = await Event.findAll({
                attributes: ['id', 'adminId', 'eventDate'],
                // where: {
                //     [Op.or]: [
                //         { '$AddedAsset.id$': assetId },
                //         { '$DeletedAsset.id$': assetId },
                //         { '$Loan->AstLoan.asset_id$': assetId },
                //         { '$Reservation->AstLoan.asset_id$': assetId },

                //         { '$AccType.id$': accTypeId },
                //         { '$AccTxn.accessory_type_id$': accTypeId },
                //         { '$Loan->AccLoans.accessory_type_id$': accTypeId },
                //         { '$Reservation->AccLoans.accessory_type_id$': accTypeId },

                //         { '$AddedUser.id$': userId },
                //         { '$DeletedUser.id$': userId },
                //         { '$Loan->UsrLoans.user_id$': userId },
                //         { '$Reservation->UsrLoans.user_id$': userId }
                //     ]
                // },
                include: [
                    {
                        model: Rmk,
                        attributes: ['id', 'text'],
                        include: {
                            model: Admin,
                            attributes: ['id', 'adminName'],
                            required: false
                        },
                        required: false
                    },
                    {
                        model: Admin,
                        attributes: ['id', 'adminName'],
                        required: false
                    },
                    {
                        model: Ast,
                        as: 'AddedAsset',
                        attributes: ['id', 'serialNumber'], // todo add details so timeline can display
                        required: false,
                        include: {
                            model: AstSType,
                            attributes: ['id','subTypeName'],
                            include: {
                                model: AstType,
                                attributes: ['id', 'typeName']
                            },
                        }
                    },
                    {
                        model: Ast,
                        as: 'DeletedAsset',
                        attributes: ['id', 'serialNumber'],
                        required: false,
                        include: {
                            model: AstSType,
                            attributes: ['id','subTypeName'],
                            include: {
                                model: AstType,
                                attributes: ['id', 'typeName']
                            },
                        }
                    },
                    {
                        model: AccTxn,
                        attributes: ['id', 'count'],
                        required: false,
                        include: {
                            model: AccType,
                            attributes: ['id', 'accessoryName'],
                        }
                    },
                    {
                        model: AccType,
                        attributes: ['id', 'accessoryName'], // add event
                        required: false
                    },
                    {
                        model: Usr,
                        as: 'AddedUser',
                        attributes: ['id', 'userName'],
                        required: false,
                        include: {
                            model: Dept,
                            attributes: ['id', 'deptName']
                        },
                    },
                    {
                        model: Usr,
                        as: 'DeletedUser',
                        attributes: ['id', 'userName'],
                        required: false,
                        include: {
                            model: Dept,
                            attributes: ['id', 'deptName']
                        },
                    },
                    {
                        model: Loan,
                        as: 'Loan',
                        required: false,
                        include: [
                            {
                                model: Usr,
                                attributes: ['id', 'userName'],
                                required: false,
                                include: {
                                    model: Dept,
                                    attributes: ['id', 'deptName']
                                },
                            },
                            {
                                model: AstLoan,
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Ast,
                                        attributes: ['id', 'serialNumber'], // todo add details so timeline can display
                                        required: false,
                                        include: {
                                            model: AstSType,
                                            attributes: ['id','subTypeName'],
                                            include: {
                                                model: AstType,
                                                attributes: ['id', 'typeName']
                                            },
                                        }
                                    }
                                ]
                            },
                            {
                                model: AccLoan,
                                attributes: ['id', 'count'],
                                required: false,
                                include: {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName'],
                                }
                            }
                        ]
                    },
                    {
                        model: Loan,
                        as: 'Reservation',
                        required: false,
                        attributes: ['id'],
                        include: [
                            {
                                model: Usr,
                                attributes: ['id', 'userName'],
                                required: false,
                                include: {
                                    model: Dept,
                                    attributes: ['id', 'deptName']
                                },
                            },
                            {
                                model: AstLoan,
                                attributes: ['id'],
                                include: {
                                    model: Ast,
                                    attributes: ['id', 'serialNumber'], // todo add details so timeline can display
                                    required: false,
                                    include: {
                                        model: AstSType,
                                        attributes: ['id','subTypeName'],
                                        include: {
                                            model: AstType,
                                            attributes: ['id', 'typeName']
                                        },
                                    }
                                }
                            },
                            {
                                model: AccLoan,
                                attributes: ['id', 'count'],
                                required: false,
                                include: {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName'],
                                }
                            },
                        ]
                    },
                    {
                        model: AstLoan,
                        as: "AssetReturn",
                        include: [
                            {
                                model: Ast,
                                attributes: ['id', 'serialNumber'], // todo add details so timeline can display
                                required: false,
                                include: {
                                    model: AstSType,
                                    attributes: ['id','subTypeName'],
                                    include: {
                                        model: AstType,
                                        attributes: ['id', 'typeName']
                                    },
                                }
                            },
                            {
                                model: Loan,
                                attributes: ['id'],
                                include: {
                                    model: Usr,
                                    attributes: ['id', 'userName'],
                                    required: false,
                                    include: {
                                        model: Dept,
                                        attributes: ['id', 'deptName']
                                    },
                                },
                            }
                        ]
                    },
                    {
                        model: AccReturn,
                        as: "AccReturns",
                        attributes: ['id', 'count'],
                        required: false,
                        include: {
                            model: AccLoan,
                            include: [
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName'],
                                },
                                {
                                    model: Loan,
                                    attributes: ['id'],
                                    include: {
                                        model: Usr,
                                        attributes: ['id', 'userName'],
                                        required: false,
                                        include: {
                                            model: Dept,
                                            attributes: ['id', 'deptName']
                                        },
                                    },
                                }
                            ]
                        }
                    },
                    {
                        model: AstTagMap,
                        as: "AddedAstTag",
                        attributes: ['id'],
                        required: false,
                        include: [
                            {
                                model: Ast,
                                required: true,
                                attributes: ['id', 'serialNumber'],
                                include: {
                                    model: AstSType,
                                    attributes: ['id','subTypeName'],
                                    include: {
                                        model: AstType,
                                        attributes: ['id', 'typeName']
                                    },
                                }
                            },
                            {
                                model: AstTag,
                                required: true,
                                attributes: ['id', 'tagName'],
                            }
                        ]
                    },
                    {
                        model: AstTagMap,
                        as: "DeletedAstTag",
                        attributes: ['id'],
                        required: false,
                        include: [
                            {
                                model: Ast,
                                attributes: ['id', 'serialNumber'],
                                required: true,
                                include: {
                                    model: AstSType,
                                    attributes: ['id','subTypeName'],
                                    include: {
                                        model: AstType,
                                        attributes: ['id', 'typeName']
                                    },
                                }
                            },
                            {
                                model: AstTag,
                                required: true,
                                attributes: ['id', 'tagName'],
                            }
                        ]
                    },
                    {
                        model: UsrTagMap,
                        as: "AddedUsrTag",
                        attributes: ['id'],
                        required: false,
                        include: [
                            {
                                model: Usr,
                                attributes: ['id', 'userName'],
                                required: true,
                                include: {
                                    model: Dept,
                                    attributes: ['id', 'deptName']
                                },
                            },
                            {
                                model: UsrTag,
                                attributes: ['id', 'tagName'],
                                required: true,
                            }
                        ]
                    },
                    {
                        model: UsrTagMap,
                        as: "DeletedUsrTag",
                        attributes: ['id'],
                        required: false,
                        include: [
                            {
                                model: Usr,
                                attributes: ['id', 'userName'],
                                required: true,
                                include: {
                                    model: Dept,
                                    attributes: ['id', 'deptName']
                                },
                            },
                            {
                                model: UsrTag,
                                attributes: ['id', 'tagName'],
                                required: true,
                            }
                        ]
                    }
                ],
                order: [['eventDate', 'DESC']]
            });

            // logger.info(eventRows.map(row => row.get({ plain: true })));
            const events = eventRows.map(row => new EventLogDTO(row)); // Converts Sequelize instances to plain objects
            // logger.info(events);
            return res.json(events);
        } catch (error) {
            logger.error(error);
            res.status(500).send({ error: error.message });
        }

        
    }

    async updateEvent(req, res) {
        const { id, field, newValue } = req.body;

        logger.info(`${id}, ${field}, ${newValue}`);
    
        try {

            if (this.fixedFields.includes(field)) throw new Error(`Permission Error: ${field} cannot be updated`);

            const event = await Event.findByPk(id);
    
            if (event) {
                event[field] = newValue;
                await event.save();
                res.json({ message: "Event updated successfully" });
            } else {
                res.status(404).json({ error: "Event not found" });
            }
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    };
}

const eventController = new EventController();
module.exports = eventController;