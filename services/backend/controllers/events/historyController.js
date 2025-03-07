const EventDTO = require("../../dtos/event.dto");
const EventLogDTO = require("../../dtos/eventLog.dto");
const logger = require("../../logging");
const { Rmk, Admin, Ast, AccTxn, AccType, Usr, Loan, AstLoan, AccReturn, AccLoan, Event, Dept, AstSType, AstType, UsrDelete, AstReturn } = require("../../models");

class HistoryController {

    async getAllEvents(req, res) {

        const filters = req.params.filters;
        
        const eventRows = await Event.findAll({
            attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate', 'cancelled'],
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
                    as: 'OpenedAdmin',
                    attributes: ['id', 'adminName'],
                    required: false
                },
                {
                    model: Admin,
                    as: 'ClosedAdmin',
                    attributes: ['id', 'adminName'],
                    required: false
                },
                {
                    // Added Asset
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
                    model: AstDelete,
                    attributes: ['id', 'serialNumber'],
                    required: false,
                    include: {
                        model: Ast,
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
                    attributes: ['id', 'userName'],
                    required: false,
                    include: {
                        model: Dept,
                        attributes: ['id', 'deptName']
                    },
                },
                {
                    model: UsrDelete,
                    attributes: ['id'],
                    required: false,
                    include: {
                        model: Usr,
                        attributes: ['id', 'userName'],
                        required: false,
                        include: {
                            model: Dept,
                            attributes: ['id', 'deptName']
                        },
                    },
                },
                {
                    model: Loan,
                    as: 'Loan',
                    attributes: ['id', 'eventId', 'filepath'],
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
                    model: AstReturn,
                    include: [
                        {
                            model: AstLoan,
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
                    ]
                },
                {
                    model: AccReturn,
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
                }
            ],
            order: [
                [Sequelize.literal("GREATEST(opened_date, expected_close_date, closed_date)"), "DESC"]
            ]              
        });

        // logger.info(eventRows.map(row => row.get({ plain: true })));
        const events = eventRows.map(row => new EventLogDTO(row)); // Converts Sequelize instances to plain objects
        // logger.info(events);
        return res.json(events);
    }

    async getAllLoans(req, res) {
        const { page, limit, filter, sort } = req.query;
        const where = {};
        if (filter) {
            where.id = { [Op.like]: `%${filter}%` };
        }
        const options = {
            order: [['id', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        };
        if (sort) {
            options.order = [[sort.split(':')[0], sort.split(':')[1] === 'desc'? 'DESC' : 'ASC']];
        }
        const loans = await Loan.findAll({
            where,
            include: [
                {
                    model: Usr,
                    attributes: ['id', 'userName'],
                },
                {
                    model: Ast,
                    attributes: ['id','serialNumber'],
                    include: {
                        model: AstSType,
                        attributes: ['id','subTypeName'],
                        include: {
                            model: AstType,
                            attributes: ['id', 'typeName']
                        },
                    },
                },
                {
                    model: AccType,
                    attributes: ['id', 'accessoryName'],
                },
            ],
           ...options,
        });
    }
}

module.exports = new HistoryController();