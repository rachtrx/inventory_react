const { Rmk, Admin, Ast, AccTxn, AccType, Usr, Loan, AstLoan, AccReturn, AccLoan, Event, Dept, AstSType, AstType, sequelize, AstTagMap, AstTag, UsrTagMap, UsrTag } = require("../models");
const logger = require('../logging.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const EventLogDTO = require("../dtos/eventLog.dto");
const { FormType, assetTagMapQuery, userTagMapQuery, getSortCondition, generateExcel } = require("./utils.js");
const { Op } = require("sequelize");
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const EventFilterController = require("./helpers/eventFilterController.js");

class EventController extends EventFilterController {

    constructor() {
        super()
        this.fixedFields = ['adminId', 'eventDate', 'id']
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

    getAllEventsEndpoint = async (req, res, next) => {
        try {
            const { filters, page = 1, limit = 30, sort } = req.query;
            const query = await this.getAllEvents(filters, sort);

            const count = query.length;
            const rows = query.slice((page - 1) * limit, page * limit);
            
            const result = rows.map(row => new EventLogDTO(row));

            res.json({
                data: result,
                totalCount: count, // Total events count
                totalPages: Math.ceil(count / limit), // Calculate total pages
                currentPage: parseInt(page, 10),
            });
        } catch (err) {
            logger.error(err)
            next(err);
        }
    }

    getAllEventsExcelEndpoint = async (req, res, next) => {
        try {
            const { filters, sort } = req.query;

            const query = await this.getAllEvents(filters, sort);
            const result = query.map(row => new EventLogDTO(row));

            const workbook = generateExcel(result, 'Event Logs')

            // Prepare response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="event_logs.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            logger.error(err)
            next(err);
        }
    }

    getAllEvents = async (filters, sort) => {

        logger.info(filters);

        const sortFieldLookup = {
            "eventDate": '"event_date"',
            "admin": '"Admin"."admin_name"'
        }

        let sortCondition;
        if (sort?.length === 2) sortCondition = getSortCondition(sortFieldLookup, sort);

        const eventTypeConditions = [
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.ADD_ASSET)
                    ? [{ '$AddedAsset.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.DEL_ASSET)
                    ? [{ '$DeletedAsset.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.UPDATE_ACC)
                    ? [{ '$AccTxn.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.UPDATE_ACC)
                    ? [{ '$AccType.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.ADD_USER)
                    ? [{ '$AddedUser.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.DEL_USER)
                    ? [{ '$DeletedUser.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.LOAN)
                    ? [{ '$Loan.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.RESERVE)
                    ? [{ '$Reservation.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.RETURN)
                    ? [{ '$AssetReturn.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.RETURN)
                    ? [{ '$AccReturns.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.TAG_ASSET)
                    ? [{ '$AddedAstTag.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.UNTAG_ASSET)
                    ? [{ '$DeletedAstTag.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.TAG_USER)
                    ? [{ '$AddedUsrTag.id$': { [Op.ne]: null } }] 
                    : []
            ),
            ...(
                filters?.eventType?.length && filters.eventType.includes(FormType.UNTAG_USER)
                    ? [{ '$DeletedUsrTag.id$': { [Op.ne]: null } }] 
                    : []
            ),
        ]

        const assetTypeConditions = filters?.typeName ? [
            { '$AddedAsset->AstSType->AstType.id$': { [Op.in]: filters.typeName } },
            { '$DeletedAsset->AstSType->AstType.id$': { [Op.in]: filters.typeName } },
            { '$Loan->AstLoan->Ast->AstSType->AstType.id$': { [Op.in]: filters.typeName } },
            { '$Reservation->AstLoan->Ast->AstSType->AstType.id$': { [Op.in]: filters.typeName } },
            { '$AssetReturn->Ast->AstSType->AstType.id$': { [Op.in]: filters.typeName } },
            { '$AddedAstTag->Ast->AstSType->AstType.id$': { [Op.in]: filters.typeName } },
            { '$DeletedAstTag->Ast->AstSType->AstType.id$': { [Op.in]: filters.typeName } },
        ] : []

        const assetSTypeConditions = filters?.subTypeName ? [
            { '$AddedAsset->AstSType.id$': { [Op.in]: filters.typeName } },
            { '$DeletedAsset->AstSType.id$': { [Op.in]: filters.typeName } },
            { '$Loan->AstLoan->Ast->AstSType.id$': { [Op.in]: filters.typeName } },
            { '$Reservation->AstLoan->Ast->AstSType.id$': { [Op.in]: filters.typeName } },
            { '$AssetReturn->Ast->AstSType.id$': { [Op.in]: filters.typeName } },
            { '$AddedAstTag->Ast->AstSType.id$': { [Op.in]: filters.typeName } },
            { '$DeletedAstTag->Ast->AstSType.id$': { [Op.in]: filters.typeName } },
        ] : []

        const deptNameConditions = filters?.deptName ? [
            { '$AddedUser->Dept.id$': { [Op.in]: filters.deptName } },
            { '$DeletedUser->Dept.id$': { [Op.in]: filters.deptName } },
            { '$Loan->Usr->Dept.id$': { [Op.in]: filters.deptName } },
            { '$Reservation->Usr->Dept.id$': { [Op.in]: filters.deptName } },
            { '$AssetReturn->Loan->Usr->Dept.id$': { [Op.in]: filters.deptName } },
            { '$AccReturns->AccLoan->Loan->Usr->Dept.id$': { [Op.in]: filters.deptName } },
            { '$AddedUsrTag->Usr->Dept.id$': { [Op.in]: filters.deptName } },
            { '$DeletedUsrTag->Usr->Dept.id$': { [Op.in]: filters.deptName } },
        ] : []

        const userTagConditions = filters?.userTag ? [
            { '$AddedUsrTag->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$DeletedUsrTag->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$AddedUser->UsrTagMaps->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$DeletedUser->UsrTagMaps->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$Loan->Usr->UsrTagMaps->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$Reservation->Usr->UsrTagMaps->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$AssetReturn->Loan->Usr->UsrTagMaps->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$AccReturns->AccLoan->Loan->Usr->UsrTagMaps->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$AddedUsrTag->Usr->UsrTagMaps->UsrTag.id$': { [Op.in]: filters.userTag } },
            { '$DeletedUsrTag->Usr->UsrTagMaps->UsrTag.id$': { [Op.in]: filters.userTag } },
            
        ] : []

        const assetTagConditions = filters?.assetTag ? [
            { '$AddedAstTag->AstTag.id$': { [Op.in]: filters.assetTag } },
            { '$DeletedAstTag->AstTag.id$': { [Op.in]: filters.assetTag } },
            { '$AddedAsset->AstTagMaps->AstTag.id$': { [Op.in]: filters.assetTag } },
            { '$DeletedAsset->AstTagMaps->AstTag.id$': { [Op.in]: filters.assetTag } },
            { '$Loan->AstLoan->Ast->AstTagMaps->AstTag.id$': { [Op.in]: filters.assetTag } },
            { '$Reservation->AstLoan->Ast->AstTagMaps->AstTag.id$': { [Op.in]: filters.assetTag } },
            { '$AssetReturn->Ast->AstTagMaps->AstTag.id$': { [Op.in]: filters.assetTag } },
        ] : []

        const snConditions = filters?.serialNumber?.trim() ? [
            { '$AddedAsset.serial_number$': { [Op.iLike]: `%${filters.serialNumber}%` } },
            { '$DeletedAsset.serial_number$': { [Op.iLike]: `%${filters.serialNumber}%` } },
            { '$Loan->AstLoan->Ast.serial_number$': { [Op.iLike]: `%${filters.serialNumber}%` } },
            { '$Reservation->AstLoan->Ast.serial_number$': { [Op.iLike]: `%${filters.serialNumber}%` } },
            { '$AssetReturn->Ast.serial_number$': { [Op.iLike]: `%${filters.serialNumber}%` } },
            { '$AddedAstTag->Ast.serial_number$': { [Op.iLike]: `%${filters.serialNumber}%` } },
            { '$DeletedAstTag->Ast.serial_number$': { [Op.iLike]: `%${filters.serialNumber}%` } },
        ] : [];

        const unConditions = filters?.userName?.trim() ? [
            { '$AddedUser.user_name$': { [Op.iLike]: `%${filters.userName}%` } },
            { '$DeletedUser.user_name$': { [Op.iLike]: `%${filters.userName}%` } },
            { '$Loan->Usr.user_name$': { [Op.iLike]: `%${filters.userName}%` } },
            { '$Reservation->Usr.user_name$': { [Op.iLike]: `%${filters.userName}%` } },
            { '$AssetReturn->Loan->Usr.user_name$': { [Op.iLike]: `%${filters.userName}%` } },
            { '$AccReturns->AccLoan->Loan->Usr.user_name$': { [Op.iLike]: `%${filters.userName}%` } },
            { '$AddedUsrTag->Usr.user_name$': { [Op.iLike]: `%${filters.userName}%` } },
            { '$DeletedUsrTag->Usr.user_name$': { [Op.iLike]: `%${filters.userName}%` } },
        ] : [];

        const adminConditions = filters?.admin ? [
            { '$Admin.id$': { [Op.in]: filters.admin } },
        ] : []

        const whereClause = {};

        const conditionGroups = [
            ...(assetTypeConditions.length > 0 ? [{ [Op.or]: assetTypeConditions }] : []),
            ...(assetSTypeConditions.length > 0 ? [{ [Op.or]: assetSTypeConditions }] : []),
            ...(deptNameConditions.length > 0 ? [{ [Op.or]: deptNameConditions }] : []),
            ...(userTagConditions.length > 0 ? [{ [Op.or]: userTagConditions }] : []),
            ...(assetTagConditions.length > 0 ? [{ [Op.or]: assetTagConditions }] : []),
            ...(adminConditions.length > 0 ? [{ [Op.or]: adminConditions }] : []),
            ...(eventTypeConditions.length > 0 ? [{ [Op.or]: eventTypeConditions }] : []),
            ...(snConditions.length > 0 ? [{ [Op.or]: snConditions }] : []),
            ...(unConditions.length > 0 ? [{ [Op.or]: unConditions }] : [])
        ];

        const dateFilter = (filters?.startDate || filters?.endDate) && {
            eventDate: {
                ...(filters.startDate && { [Op.gte]: filters.startDate }),
                ...(filters.endDate && {
                    [Op.lte]: new Date(filters.endDate).setHours(23, 59, 59, 999)
                }),
            }
        };
        
        const andConditions = [
            ...conditionGroups,
            ...(dateFilter ? [dateFilter] : [])
        ];
        
        if (andConditions.length > 0) {
            whereClause[Op.and] = andConditions;
        }

        console.log(filters.endDate);
        const query = await Event.findAll({
            attributes: ['id', 'adminId', 'eventDate'],
            logger: console.log,
            where: whereClause,
            include: [
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
                    include: [
                        {
                            model: AstSType,
                            attributes: ['id','subTypeName'],
                            include: {
                                model: AstType,
                                attributes: ['id', 'typeName']
                            },
                        },
                        ...(filters?.assetTag ? [assetTagMapQuery(filters.assetTag)] : [])
                    ],
                },
                {
                    model: Ast,
                    as: 'DeletedAsset',
                    attributes: ['id', 'serialNumber'],
                    required: false,
                    include: [
                        {
                            model: AstSType,
                            attributes: ['id','subTypeName'],
                            include: {
                                model: AstType,
                                attributes: ['id', 'typeName']
                            },
                        },
                        ...(filters?.assetTag ? [assetTagMapQuery(filters.assetTag)] : [])
                    ],
                },
                {
                    model: AccTxn,
                    attributes: ['id', 'count'],
                    required: false,
                    include: {
                        model: AccType,
                        attributes: ['id', 'accessoryName'],
                    },
                },
                {
                    model: AccType,
                    attributes: ['id', 'accessoryName'], // add event
                    required: false,
                },
                {
                    model: Usr,
                    as: 'AddedUser',
                    attributes: ['id', 'userName'],
                    required: false,
                    include: [
                        {
                            model: Dept,
                            attributes: ['id', 'deptName']
                        },
                        ...(filters?.userTag ? [userTagMapQuery(filters.userTag)] : [])
                    ],
                },
                {
                    model: Usr,
                    as: 'DeletedUser',
                    attributes: ['id', 'userName'],
                    required: false,
                    include: [
                        {
                            model: Dept,
                            attributes: ['id', 'deptName']
                        },
                        ...(filters?.userTag ? [userTagMapQuery(filters.userTag)] : [])
                    ],
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
                            include: [
                                {
                                    model: Dept,
                                    attributes: ['id', 'deptName']
                                },
                                ...(filters?.userTag ? [userTagMapQuery(filters.userTag)] : [])
                            ],
                        },
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            include: [
                                {
                                    model: Ast,
                                    attributes: ['id', 'serialNumber'], // todo add details so timeline can display
                                    required: false,
                                    include: [
                                        {
                                            model: AstSType,
                                            attributes: ['id','subTypeName'],
                                            include: {
                                                model: AstType,
                                                attributes: ['id', 'typeName']
                                            },
                                        },
                                        ...(filters?.assetTag ? [assetTagMapQuery(filters.assetTag)] : [])
                                    ]
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
                    ],
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
                            include: [
                                {
                                    model: Dept,
                                    attributes: ['id', 'deptName']
                                },
                                ...(filters?.userTag ? [userTagMapQuery(filters.userTag)] : [])
                            ],
                        },
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            include: {
                                model: Ast,
                                attributes: ['id', 'serialNumber'], // todo add details so timeline can display
                                required: false,
                                include: [
                                        {
                                        model: AstSType,
                                        attributes: ['id','subTypeName'],
                                        include: {
                                            model: AstType,
                                            attributes: ['id', 'typeName']
                                        },
                                    },
                                    ...(filters?.assetTag ? [assetTagMapQuery(filters.assetTag)] : [])
                                ]
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
                    ],
                },
                {
                    model: AstLoan,
                    as: "AssetReturn",
                    include: [
                        {
                            model: Ast,
                            attributes: ['id', 'serialNumber'], // todo add details so timeline can display
                            required: false,
                            include: [
                                {
                                    model: AstSType,
                                    attributes: ['id','subTypeName'],
                                    include: {
                                        model: AstType,
                                        attributes: ['id', 'typeName']
                                    },
                                },
                                ...(filters?.assetTag ? [assetTagMapQuery(filters.assetTag)] : [])
                            ]
                        },
                        {
                            model: Loan,
                            attributes: ['id'],
                            include: {
                                model: Usr,
                                attributes: ['id', 'userName'],
                                required: false,
                                include: [
                                    {
                                        model: Dept,
                                        attributes: ['id', 'deptName']
                                    },
                                    ...(filters?.userTag ? [userTagMapQuery(filters.userTag)] : [])
                                ],
                            },
                        }
                    ],
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
                                    include: [
                                        {
                                            model: Dept,
                                            attributes: ['id', 'deptName']
                                        },
                                        ...(filters?.userTag ? [userTagMapQuery(filters.userTag)] : [])
                                    ],
                                },
                            }
                        ]
                    },
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
                    ],
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
                    ],
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
                    ],
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
                    ],
                }
            ],
            order: sortCondition ? [sortCondition] : [['eventDate', 'DESC']]
        });

        return query;
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

    async getSignature(req, res) {
        try {
            const { filepath } = req.params;

            if (!/^[\w\-]+\.png$/.test(filepath)) {
                return res.status(400).send('Invalid filename');
            }

            const fullPath = path.join(process.env.SIGNATURES_DIR, filepath);

            if (!fs.existsSync(fullPath)) {
                return res.status(404).send('Signature file not found');
            }
        
            res.set('Content-Type', 'image/png');
            res.sendFile(path.resolve(fullPath)); // resolves absolute path just in case
        } catch (err) {
            console.error('Error getting signature:', err);
            res.status(500).send('Internal server error');
        }
    }
}

const eventController = new EventController();
module.exports = eventController;