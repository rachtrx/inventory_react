const EventDTO = require("../dtos/event.dto");
const logger = require("../logging");
const { Rmk, Admin, Ast, AccTxn, AccType, Usr, Loan, AstLoan, AccReturn, AccLoan, Event } = require("../models");

class HistoryController {

    async getAllEvents(req, res) {

        const filters = req.params.filters;

        const assetModelDetails = {
            model: Ast,
            attributes: ['id', 'serialNumber'],
        }

        const accTypeModelDetails = {
            model: AccType,
            attributes: ['id', 'accessoryName'],
        }

        const userModelDetails = {
            model: Usr,
            attributes: ['id', 'userName'],
        }
        
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
                },
                {
                    model: Ast,
                    as: 'DeletedAsset',
                    attributes: ['id', 'serialNumber'],
                    required: false
                },
                {
                    model: AccTxn,
                    attributes: ['id', 'count'],
                    required: false,
                    include: accTypeModelDetails
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
                },
                {
                    model: Usr,
                    as: 'DeletedUser',
                    attributes: ['id', 'userName'],
                    required: false,
                },
                {
                    model: Loan,
                    as: 'Loan',
                    attributes: ['id', 'reserveEventId', 'loanEventId', 'filepath'],
                    required: false,
                    include: [
                        userModelDetails,
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            include: [
                                assetModelDetails,
                                {
                                    model: Event,
                                    as: 'ReturnEvent',
                                    attributes: ['id', 'eventDate'],
                                    required: false
                                },
                            ]
                        },
                        {
                            model: AccLoan,
                            attributes: ['id', 'count'],
                            required: false,
                            include: [
                                accTypeModelDetails,
                                {
                                    model: AccReturn,
                                    attributes: ['id', 'count'],
                                    required: false,
                                    include: {
                                        model: Event,
                                        as: 'ReturnEvent',
                                        attributes: ['id', 'eventDate']
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Loan,
                    as: 'Reservation',
                    required: false,
                    attributes: ['id'],
                    include: [
                        userModelDetails,
                        {
                            model: Event,
                            as: 'CancelEvent',
                            attributes: ['id', 'eventDate'],
                            required: false
                        },
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            include: assetModelDetails
                        },
                        {
                            model: AccLoan,
                            attributes: ['id', 'count'],
                            required: false,
                            include: accTypeModelDetails
                        },
                    ]
                }
            ],
            order: [['eventDate', 'DESC']]
        });

        logger.info(eventRows.map(row => row.get({ plain: true })));
        const events = eventRows.map(row => new EventDTO(row)); // Converts Sequelize instances to plain objects
        logger.info(events);
        return events;
    }
}

module.exports = new HistoryController();