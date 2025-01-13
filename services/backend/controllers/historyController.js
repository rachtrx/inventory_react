class HistoryController {

    async getAllEvents(req, res) {

        const filters = req.params.filters;
        
        const eventRows = await Event.findAll({
            attributes: ['id', 'adminId', 'eventDate'],
            where: {
                [Op.or]: [
                    { '$AddedAsset.id$': assetId },
                    { '$DeletedAsset.id$': assetId },
                    { '$Loan->AstLoan.asset_id$': assetId },
                    { '$Reservation->AstLoan.asset_id$': assetId },

                    { '$AccType.id$': accTypeId },
                    { '$AccTxn.accessory_type_id$': accTypeId },
                    { '$Loan->AccLoans.accessory_type_id$': accTypeId },
                    { '$Reservation->AccLoans.accessory_type_id$': accTypeId },

                    { '$AddedUser.id$': userId },
                    { '$DeletedUser.id$': userId },
                    { '$Loan->UsrLoans.user_id$': userId },
                    { '$Reservation->UsrLoans.user_id$': userId }
                ]
            },
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
                    attributes: [], // todo add details so timeline can display
                    required: false
                },
                {
                    model: Ast,
                    as: 'DeletedAsset',
                    attributes: [],
                    required: false
                },
                {
                    model: AccTxn,
                    attributes: ['id', 'count'],
                    required: false
                },
                {
                    model: AccType,
                    attributes: [], // add event
                    required: false
                },
                {
                    model: Usr,
                    as: 'AddedUser',
                    attributes: ['id'],
                    required: false
                },
                {
                    model: Usr,
                    as: 'DeletedUser',
                    attributes: ['id'],
                    required: false
                },
                {
                    model: Loan,
                    as: 'Loan',
                    required: false,
                    include: [
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            include: {
                                model: Event,
                                as: 'ReturnEvent',
                                attributes: ['id', 'eventDate'],
                                required: false
                            }
                        },
                        {
                            model: AccLoan,
                            attributes: ['id', 'count'],
                            required: false,
                            include: [
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName']
                                },
                                {
                                    model: AccReturn,
                                    attributes: ['id', 'count'],
                                    required: false,
                                    include: {
                                        model: Event,
                                        as: 'ReturnEvent',
                                        attributes: ['id', 'eventDate'],
                                        required: true
                                    }
                                }
                            ]
                        },
                        {
                            model: UsrLoan,
                            attributes: ['filepath'],
                            include: {
                                model: Usr,
                                attributes: ['id', 'userName', 'bookmarked']
                            }
                        }
                    ]
                },
                {
                    model: Loan,
                    required: false,
                    as: 'Reservation',
                    include: [
                        {
                            model: Event,
                            as: 'CancelEvent',
                            attributes: ['id', 'eventDate'],
                            required: false
                        },
                        {
                            model: AstLoan,
                            attributes: ['id'],
                        },
                        {
                            model: AccLoan,
                            attributes: ['id', 'count'],
                            required: false,
                            include: [
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName']
                                }
                            ]
                        },
                        {
                            model: UsrLoan,
                            attributes: ['filepath'],
                            include: {
                                model: Usr,
                                attributes: ['id', 'userName', 'bookmarked']
                            }
                        }
                    ]
                }
            ],
            order: [['eventDate', 'DESC']]
        });

        const events = eventRows.map(row => new EventDTO(row)); // Converts Sequelize instances to plain objects
        logger.info(events);

        return events;
    }
}

module.exports = new HistoryController();