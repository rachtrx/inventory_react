const { Admin, Ast, AccType, Usr, AccLoan, Loan, sequelize, AstLoan, Event, AccTxn, AccReturn, Rmk, Sequelize } = require('@models/index.js');
const logger = require('@/utils/logging.js');
const { getAllOptions, getSortCondition } = require('@/controllers/utils.js');

const AccTypeDTO = require('@dtos/accType.dto.js');
const EventDTO = require('@dtos/event.dto.js');
const LoanDTO = require('@dtos/loan.dto.js');

const { DateTime } = require("luxon");
const { Op } = require('sequelize');
const { generateSecureID } = require('@utils/validation.js');
const { LoanSearch } = require('@services/search/loanSearch.js');
const BaseController = require('../baseController');

class AccessoryController extends BaseController{

    constructor() {
        super()
        this.dtoCallback = accTypeRow => new AccTypeDTO(accTypeRow);
        this.excelName = 'Accessory Logs';
    }

    getType = async (accessoryTypeId, options = {}) => {
        return await AccType.findOne({
            where: { id: accessoryTypeId },
            ...options
        });
    }

    async getFilters (req, res) {
        const { field } = req.body;

        let options;
        try {
            if (field === 'accessoryName') {
                const meta = [AccType, 'accessoryName', 'id'];
                options = await getAllOptions(meta);
            }
            
            return res.json(options || [])
            
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
        return
    }

    async getOngoingLoans(req, res) {
        try {
            const accTypeId = req.params.id;
            console.log(accTypeId);
            const loanSearch = new LoanSearch();
            const loanRows = await loanSearch.getLoansById({ accTypeId })
            res.status(200).json(loanRows.map(row => new LoanDTO(row)));
        } catch (error) {
            console.error("Error fetching loans:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async getOngoingReservations(req, res) {
        try {
            const accTypeId = req.params.id;
            const loanSearch = new LoanSearch();
            const loanRows = await loanSearch.getLoansById({ accTypeId, status: Loan.RESERVED })
            res.status(200).json(loanRows.map(row => new LoanDTO(row)));
        } catch (error) {
            console.error("Error fetching reservations:", error);
            res.status(500).json({ error: error.message });
        }
    }

    getAllItems = async (filters, sort) => {

        const sortFieldLookup = {
            "accessoryName": '"accessory_name"'
        }

        let sortCondition;
        if (sort?.length === 2) sortCondition = getSortCondition(sortFieldLookup, sort);

        const accessoriesExist = await AccType.count();
        if (accessoriesExist === 0) return [];

        let query = await AccType.findAll({
            attributes: ['id', 'accessoryName', 'stock'],
            ...(filters.accessoryName?.length > 0 && { where: { accessoryName: { [Op.iLike]: `%${filters.accessoryName}%` } } }),
            include: [
                {
                    model: AccTxn,
                    required: false,
                    attributes: ['id', 'count'],
                },
                {
                    model: AccLoan,
                    required: false,
                    attributes: ['id', 'count'],
                    include: [
                        {
                            model: AccReturn,
                            attributes: ['id', 'count'],
                            required: false
                        },
                        {
                            model: Loan,
                            required: true,
                            include: [
                                {
                                    model: Usr,
                                    attributes: ['id', 'userName', 'bookmarked'],
                                },
                                {
                                    model: AstLoan,
                                    required: false,
                                    include: {
                                        model: Ast,
                                        attributes: ['id', 'alias', 'serialNumber'],
                                    }
                                }
                            ]
                        }
                    ]
                }
            ],
            group: [
                '"AccType"."id"',
                '"AccTxns"."id"',
                '"AccLoans"."id"',
                '"AccLoans->AccReturns"."id"',
                '"AccLoans->Loan"."id"',
                '"AccLoans->Loan->Usr"."id"',
                '"AccLoans->Loan->AstLoan"."id"',
                '"AccLoans->Loan->AstLoan->Ast"."id"',
            ],
            order: sortCondition ? [sortCondition] : [], // Handle sorting dynamically
            logging: console.log // Logs the full query for debugging
        });

        return query;
    }

    getAccType = async (req, res) => {
        const accTypeId = req.params.id;
    
        try {
            const accTypeDetails = await AccType.findOne({
                attributes: [
                    'id',
                    'accessoryName',
                    'stock',
                ],
                where: { id: accTypeId } //,
                // include: [
                //     {
                //         model: AstSType,
                //         attributes: ['subTypeName'],
                //         
                //     },
                    // include: {
                    //             model: AstType,
                    //             attributes: ['typeName']
                    //         }
                // ],
            });
            
            if (!accTypeDetails) return res.status(404).send({ error: "Ast not found" });
            
            const accType = new AccTypeDTO(accTypeDetails);

            accType.history = await this.getAllEvents(accTypeId);

            if (accType.history && accType.history.length > 0) {

                accType.currentUsers = Array.from(
                    new Map( // IMPT ensuring no duplicate keys by creating a map before extracting users through values
                        accType.history
                            .filter(event => event.loan?.accLoans?.length && (
                                event.loan.accLoans.some(accLoan => accLoan?.accType?.isMatching && accLoan.unreturned !== 0)
                            ))
                            .map(event => [
                                event.loan.user.userId,
                                event.loan.user
                            ])
                    ).values()
                )

                accType.pastUsers = Array.from(
                    new Map(
                        accType.history
                            .filter(event => event.loan?.accLoans && event.loan.accLoans.length > 0 && (
                                event.loan.accLoans.some(accLoan => accLoan?.accType?.isMatching && accLoan.unreturned === 0)
                            ))
                            .map(event => [
                                event.loan.user.userId,
                                event.loan.user
                            ])
                    ).values()
                )

                accType.reservedUsers = Array.from(
                    new Map(
                        accType.history
                            .filter(event => event.reservation?.accLoans && event.reservation.accLoans.length > 0 && !event.reservation.cancelEvent && (
                                event.reservation.accLoans.some(accLoan => accLoan?.accType?.isMatching)
                            ))
                            .map(event => [
                                event.loan.user.userId,
                                event.loan.user
                            ])
                    ).values()
                )
            }

            res.json(accType);
        } catch (error) {
            logger.error("Error fetching accessory details:", error);
            res.status(500).send({ error: error.message });
        }
    }

    async getAllEvents(accTypeId) {
        
        try {
            const eventRows = await Event.findAll({
                attributes: ['id', 'adminId', 'eventDate'],
                // logging: console.log,
                where: {
                    [Op.or]: [
                        { '$AccType.id$': { [Op.ne]: null } },
                        { '$AccTxn.accessory_type_id$': { [Op.ne]: null } },
                        { '$Loan->AccLoans.accessory_type_id$': { [Op.ne]: null } },
                        { '$Reservation->AccLoans.accessory_type_id$': { [Op.ne]: null } }
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
                        model: AccTxn,
                        attributes: ['id', 'count'],
                        where: { accessoryTypeId: accTypeId },
                        required: false
                    },
                    {
                        model: AccType,
                        attributes: ['id'], // add event
                        where: { id: accTypeId },
                        required: false
                    },
                    {
                        model: Loan,
                        as: 'Loan',
                        required: false,
                        where: Sequelize.literal(`
                            EXISTS (
                                SELECT 1
                                FROM acc_loans 
                                WHERE "Loan"."id" = acc_loans.loan_id
                                AND "Loan"."loan_event_id" IS NOT NULL
                                AND acc_loans.accessory_type_id = '${accTypeId}'
                            )
                        `),
                        include: [
                            {
                                model: Usr,
                                attributes: ['id', 'userName', 'bookmarked']
                            },
                            {
                                model: AstLoan,
                                required: false,
                                include: [
                                    {
                                        model: Ast,
                                        required: true,
                                        attributes: ['id', 'alias', 'serialNumber'],
                                    },
                                    {
                                        model: Event,
                                        as: 'ReturnEvent',
                                        attributes: ['id', 'eventDate'],
                                        required: false,
                                        include: {
                                            model: Rmk,
                                            attributes: ['id', 'text', 'remarkDate'],
                                            include: {
                                                model: Admin,
                                                attributes: ['id', 'adminName'],
                                                required: false
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                model: AccLoan,
                                required: true,
                                include: [
                                    {
                                        model: AccType,
                                        attributes: ['id', 'accessoryName', [Sequelize.literal(`
                                            CASE
                                                WHEN "Loan->AccLoans->AccType"."id" = '${accTypeId}' THEN true
                                                ELSE false
                                            END
                                        `),
                                        'isMatching']]
                                    },
                                    {
                                        model: AccReturn,
                                        required: false,
                                        include: {
                                            model: Event,
                                            as: 'ReturnEvent',
                                            attributes: ['id', 'eventDate'],
                                            required: false,
                                            include: {
                                                model: Rmk,
                                                attributes: ['id', 'text', 'remarkDate'],
                                                include: {
                                                    model: Admin,
                                                    attributes: ['id', 'adminName'],
                                                    required: false
                                                }
                                            }
                                        }
                                    },
                                ]
                            },
                            {
                                model: Event,
                                as: "ReserveEvent",
                                attributes: ['id', 'eventDate'],
                                required: false,
                                include: {
                                    model: Rmk,
                                    attributes: ['id', 'text', 'remarkDate'],
                                    include: {
                                        model: Admin,
                                        attributes: ['id', 'adminName'],
                                        required: false
                                    }
                                }
                            }
                        ]
                    },
                    {
                        model: Loan,
                        required: false,
                        as: 'Reservation',
                        where: { [Op.and]: [
                            Sequelize.literal(`
                                EXISTS (
                                    SELECT 1
                                    FROM acc_loans 
                                    WHERE "Loan"."id" = acc_loans.loan_id
                                    AND "Loan"."loan_event_id" IS NULL
                                    AND acc_loans.accessory_type_id = '${accTypeId}'
                                )
                            `),
                        ]},
                        include: [
                            {
                                model: Usr,
                                attributes: ['id', 'userName', 'bookmarked']
                            },
                            {
                                model: AstLoan,
                                attributes: ['id'],
                                required: false,
                                include: {
                                    model: Ast,
                                    required: true,
                                    attributes: ['id', 'alias', 'serialNumber'],
                                }
                            },
                            {
                                model: AccLoan,
                                attributes: ['id', 'count'],
                                required: true,
                                // required: true,
                                include: {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName', [Sequelize.literal(`
                                        CASE
                                            WHEN "Reservation->AccLoans->AccType"."id" = '${accTypeId}' THEN true
                                            ELSE false
                                        END
                                    `),
                                    'isMatching']]
                                },
                            },
                            {
                                model: Event,
                                as: "ReserveEvent",
                                attributes: ['id', 'eventDate'],
                                required: false,
                                include: {
                                    model: Rmk,
                                    attributes: ['id', 'text', 'remarkDate'],
                                    include: {
                                        model: Admin,
                                        attributes: ['id', 'adminName'],
                                        required: false
                                    }
                                }
                            }
                        ]
                    }
                ],
                order: [['eventDate', 'DESC']]
            });
            // logger.info(eventRows.map(row => row.get({plain: true})))

            const events = eventRows.map(event => {
                const parsedEvent = new EventDTO(event.dataValues)
                if (!parsedEvent.loan) return parsedEvent;
                parsedEvent.loan = parsedEvent.loan.setReturnEvents();
                return parsedEvent;
            });
            
            logger.info(events);

            return events;
        } catch (error) {
            console.error(error);
            logger.error(`Error retrieving events: ${error}`);
            throw error;
        }
    }

    updateAssetTypeSuggestion = async (req, res, next) => {
        try {
            // const { assetId, peripheralId, saved } = req.body;
    
            // // Fetch assetVariant with the related asset
            // const assetVariant = await AstSType.findOne({
            //     attributes: ['assetTypeId'],
            //     include: {
            //         model: Ast,
            //         attributes: ['id'],
            //         where: { id: assetId },
            //     },
            // });
    
            // if (!assetVariant) {
            //     throw new Error('AstSType not found');
            // }
    
            // // Find the related AstTypeAcc
            // if (saved) {
            //     const assetTypePeripheral = await AstTypeAcc.findOne({
            //         where: {
            //             assetTypeId: assetVariant.assetTypeId,
            //             peripheralId: peripheralId,
            //         },
            //     });
        
            //     if (assetTypePeripheral) {
            //         await assetTypePeripheral.destroy();
            //         res.status(200).json({ message: 'Acc removed successfully' });
            //     } else {
            //         throw new Error('No composite key found');
            //     }
            // } else {
            //     await AstTypeAcc.create({
            //         assetTypeId: assetVariant.assetTypeId,
            //         peripheralId: peripheralId,
            //     });
            //     res.status(201).json({ message: 'Acc created successfully' });
            // }
            res.status(201).json({ message: 'Acc created successfully' });
        } catch (error) {
            next(error);
        }
    };

    getSuggestedAccessories = async (req, res) => {
        // const { assetId } = req.body;

        // let asset = await Ast.findOne({
        //     attributes: ['id'],
        //     include: {
        //         model: AstSType,
        //         attributes: ['id'],
        //         include: [
        //             {
        //                 model: AstSTypeAcc,
        //                 attributes: ['peripheralTypeId'],
        //                 required: true,
        //                 include: {
        //                     model: AccType,
        //                     attributes: ['id', 'name', 'count'],
        //                 },
        //             },
        //             {
        //                 model: AstType,
        //                 attributes: ['id'],
        //                 required: true,
        //                 include: {
        //                     model: AstTypeAcc,
        //                     attributes: ['peripheralTypeId'],
        //                     required: true,
        //                     include: {
        //                         model: AccType,
        //                         attributes: ['id', 'name', 'count'],
        //                     }
        //                 }
        //             }
        //         ],
        //     },
        //     where: { id: assetId },
        // })

        // if (!asset) {
        //     return res.status(404).json({ message: 'Ast not found' });
        // }

        // // Combine both arrays
        // const peripheralsArr = [
        //     ...(asset?.AstSType?.VariantPeripherals || []),
        //     ...(asset?.AstSType?.AstType?.AssetTypePeripherals || [])
        // ];
    
        // // Remove duplicates based on the peripheralTypeId
        // const uniquePeripherals = peripheralsArr.filter((accessory, index, self) =>
        //     index === self.findIndex((p) => p.AccType.id === accessory.AccType.id)
        // );
    
        // // Map to the desired structure
        // const peripherals = uniquePeripherals.map((match) => ({
        //     id: match.AccType.id,
        //     accessoryName: match.AccType.accessoryName,
        //     stock: match.AccType.stock
        // }));

        // console.log(peripherals.slice(1, 10));
    
        res.status(200).json({ message: 'Acc created successfully' });
    }

    // SECTION helpers

    async createAccessoryEndpoint(req, res) {
        const { accessoryName } = req.body;

        const authId = req.auth.id;

        const transaction = await sequelize.transaction();

        try {
            const addAccTypeEventId = generateSecureID();

            const dateTimeNow = DateTime.now().setZone('Asia/Singapore').toJSDate();

            const accRow = await AccType.findOne({
                attributes: ["accessoryName"],
                where: { accessoryName }
            })

            if (accRow) {
                throw new Error(`Accessory with name ${accessoryName} already exists.`);
            }

            await Event.create({
                id: addAccTypeEventId,
                eventDate: dateTimeNow, // TODO
                adminId: authId, // req.auth.id
            }, { transaction });

            const accType = await AccType.create({ 
                id: generateSecureID(), 
                accessoryName: accessoryName, 
                stock: 0,
                addEventId: addAccTypeEventId
            }, { transaction });

            await transaction.commit();
            res.status(201).json({ 
                message: "Accessories added successfully",
                newAccType: new AccTypeDTO(accType)
            });
        } catch (error) {
            logger.error(error);
            await transaction.rollback();
            res.status(500).json({ error: error.message });
        }
    }

    // Method to reduce accessory count

    addAccessoriesEndpoint = async (req, res) => {
        const { accessories = [] } = req.body;
        const transaction = await sequelize.transaction();

        if (!accessories.length) res.status(400).json({ error: "No accessories detected" });

        if (accessories.some(acc => acc.count === 0)) res.status(400).json({ error: "Accessory Change cannot be 0" });
    
        try {
            for (const accessory of accessories) {

                let { accessoryTypeId, accessoryName, count, remarks } = accessory;

                const type = await this.getType(accessoryTypeId, { transaction });
                if (!type) throw new Error (`${accessoryName} not found`);

                const eventId = generateSecureID();
                const authId = req.auth.id

                const curDate = new Date();

                await Event.create({
                    id: eventId,
                    eventDate: curDate,
                    adminId: authId,
                }, { transaction: transaction });

                type.stock += count;
                await type.save({ transaction });
                
                await AccTxn.create({
                    id: generateSecureID(),
                    accessoryTypeId: accessoryTypeId,
                    count: count,
                    eventId: eventId
                }, { transaction: transaction });

                if (remarks && remarks !== '') {
                    await Rmk.create({
                        id: generateSecureID(),
                        eventId: eventId,
                        remarkDate: curDate,
                        remarks: remarks,
                        adminId: authId
                    }, { transaction: transaction });
                }
            }
            await transaction.commit(); // Commit only after all peripherals are processed
            res.status(201).json({ message: "Accessories added successfully" });
        } catch (error) {
            logger.error(error);
            await transaction.rollback(); // Rollback if any error occurs
            res.status(500).json({ error: error.message });
        }
    }

    // TODO not used
    async validateAccessories(accLoanIds, transaction) {
        return await Promise.all(
            [...accLoanIds].map(accLoanId => AccLoan.findByPk(accLoanId, { 
                transaction,
                attributes: ['returnEventId'],
                include: [{
                    model: Loan,
                    include: {
                        model: AstLoan,
                        include: {
                            model: Ast,
                            attributes: ['alias']
                        },
                        required: false
                    }
                },{
                    model: AccType,
                    attributes:['accessoryName']
                }]
            }))
        );
    }

    // async bookmarkPeripheral(req, res) {
    //     const { id, bookmarked } = req.body;
    //     try {
    //         const accType = await AccType.findByPk(id);
    //         if (accType) {
    //             accType.bookmarked = bookmarked === true ? 1 : 0;
    //             await accType.save();
    //             res.json({ message: "Bookmark updated successfully" });
    //         } else {
    //             res.status(404).json({ message: "Acc Type not found" });
    //         }
    //     } catch (error) {
    //         console.error('Error updating Acc Type:', error);
    //         res.status(500).send('Internal Server Error');
    //     }
    // };
};

module.exports = new AccessoryController();