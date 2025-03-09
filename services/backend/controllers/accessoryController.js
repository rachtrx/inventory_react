const { Admin, Ast, AccType, Usr, AccLoan, Loan, sequelize, AstLoan, Event, AccTxn, AccReturn, AstSTypeAcc, AstTypeAcc, AstSType, AstType, Rmk, Sequelize } = require('../models/index.js');
const logger = require('../logging.js');
const { getAllOptions } = require('./utils.js');
const AccTypeDTO = require('../dtos/accType.dto.js');
const EventDTO = require('../dtos/event.dto.js');

const { DateTime } = require("luxon");
const { Op } = require('sequelize');
const { generateSecureID } = require('../utils/nanoidValidation.js');

class AccessoryController {

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

    async getAccesories (req, res) {

        const { filters } = req.body
        logger.info(filters)

        const accessoriesExist = await AccType.count();
        if (accessoriesExist === 0) {
            return res.json([]);
        }

        try {
            let query = await AccType.findAll({
                attributes: ['id', 'accessoryName', 'stock'],
                ...(filters.accessoryName.length > 0 && { where: { id: { [Op.in]: filters.accessoryName } } }),
                include: [{
                    model: AccTxn,
                    required: false,
                    attributes: ['id', 'count'], // TODO change to count
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
                }],
                // raw: true,
                group: [
                    // AccType attributes
                    '"AccType"."id"',
                    // Acc attributes
                    '"AccTxns"."id"',
                    // AccLoan attributes
                    '"AccLoans"."id"',
                    '"AccLoans->AccReturns"."id"',
                    '"AccLoans->Loan"."id"',
                    '"AccLoans->Loan->Usr"."id"',

                    '"AccLoans->Loan->AstLoan"."id"',
                    '"AccLoans->Loan->AstLoan->Ast"."id"',
                ],
            });

            const result = query.map(accTypeRow => {
                return new AccTypeDTO(accTypeRow);
            });
    
            logger.info(result);
            res.json(result);
        } catch (error) {
            logger.error(error)
            return res.status(500).json({ error: error.message })
        }
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
                            .filter(event => event.loan?.accLoans && event.loan.accLoans.length > 0 && (
                                event.loan.accLoans.some(accLoan => accLoan.accessoryTypeId === accTypeId && accLoan.unreturned !== 0)
                            ))
                            .map(event => { 
                                [event.loan.user.userId, event.loan.user]
                            })
                    ).values()
                )

                accType.pastUsers = Array.from(
                    new Map(
                        accType.history
                            .filter(event => event.loan?.accLoans && event.loan.accLoans.length > 0 && (
                                event.loan.accLoans.some(accLoan => accLoan.accessoryTypeId === accTypeId && accLoan.unreturned === 0)
                            ))
                            .map(event => { 
                                [event.loan.user.userId, event.loan.user]
                            })
                    ).values()
                )

                accType.reservedUsers = Array.from(
                    new Map(
                        accType.history
                            .filter(event => event.reservation?.accLoans && event.reservation.accLoans.length > 0 && !event.reservation.cancelEvent && (
                                event.reservation.accLoans.some(accLoan => accLoan.accessoryTypeId === accTypeId)
                            ))
                            .map(event => { 
                                [event.loan.user.userId, event.loan.user]
                            })
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
        const eventRows = await Event.findAll({
            attributes: ['id', 'adminId', 'eventDate'],
            where: {
                [Op.or]: [
                    { '$AccType.id$': accTypeId },
                    { '$AccTxn.accessory_type_id$': accTypeId },
                    { '$Loan->AccLoans.accessory_type_id$': accTypeId },
                    { '$Reservation->AccLoans.accessory_type_id$': accTypeId }
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
                    required: false
                },
                {
                    model: AccType,
                    attributes: [], // add event
                    required: false
                },
                {
                    model: Loan,
                    as: 'Loan',
                    required: false,
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
                            required: false,
                            include: [
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName']
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
                                {
                                    model: Loan,
                                    required: false,
                                    include: [
                                        {
                                            model: AccLoan,
                                            required: false,
                                            include: [
                                                {
                                                    model: AccType,
                                                    attributes: ['id', 'accessoryName'],
                                                    where: { id: { [Op.ne]: accTypeId } }
                                                },
                                                {
                                                    model: AccReturn,
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
                            ]
                        },
                    ]
                },
                // {
                //     model: Loan,
                //     required: false,
                //     as: 'Reservation',
                //     where: { [Op.and]: [
                //         {loanEventId: { [Op.eq]: null}},
                //         {reserveEventId: { [Op.ne]: null}}
                //     ]},
                //     include: [
                //         {
                //             model: Usr,
                //             attributes: ['id', 'userName', 'bookmarked']
                //         },
                //         {
                //             model: AstLoan,
                //             attributes: ['id'],
                //             required: false,
                //             include: {
                //                 model: Ast,
                //                 required: true,
                //                 attributes: ['id', 'alias', 'serialNumber'],
                //             }
                //         },
                //         {
                //             model: AccLoan,
                //             attributes: ['id', 'count'],
                //             required: false,
                //             include: [
                //                 {
                //                     model: AccType,
                //                     attributes: ['id', 'accessoryName']
                //                 },
                //                 {
                //                     model: Loan,
                //                     required: false,
                //                     include: {
                //                         model: AccLoan,
                //                         attributes: ['id', 'count'],
                //                         required: false,
                //                         include: [
                //                             {
                //                                 model: AccType,
                //                                 attributes: ['id', 'accessoryName'],
                //                                 where: { id: { [Op.ne]: accTypeId } }
                //                             },
                //                             {
                //                                 model: AccReturn,
                //                                 attributes: ['id', 'count'],
                //                                 required: false,
                //                                 include: {
                //                                     model: Event,
                //                                     as: 'ReturnEvent',
                //                                     attributes: ['id', 'eventDate'],
                //                                     required: true
                //                                 }
                //                             },
                //                         ]
                //                     },
                //                 }
                //             ]
                //         }
                //     ]
                // }
            ],
            order: [['eventDate', 'DESC']]
        });

        logger.info(eventRows.map(row => row.get({plain: true})))

        const events = eventRows.map(event => {
            if (event.Loan && event.Loan.AccLoans) {
                if (event.Loan.AccLoans.Loan && event.Loan.AccLoans.Loan.AccLoans) {
                    event.Loan.AccLoans = event.Loan.AccLoans.concat(event.Loan.AccLoans.Loan.AccLoans);
                }
                event.Loan.AccLoans.forEach(accLoan => {
                    accLoan.Loan = null;
                });
            } else if (event.Reservation && event.Reservation.AccLoans) {
                if (event.Reservation.AccLoans.Loan && event.Reservation.AccLoans.Loan.AccLoans) {
                    event.Reservation.AccLoans = event.Reservation.AccLoans.concat(event.Reservation.AccLoans.Loan.AccLoans);
                }
                event.Reservation.AccLoans.forEach(accLoan => {
                    accLoan.Loan = null;
                });
            }
            return new EventDTO(event);
        });
        
        logger.info(events);

        return events;
    }

    async searchAccessories (req, res) {
        const { value } = req.body;

        const isBulkSearch = Array.isArray(value) ? true : false;
        const searchTerm = isBulkSearch ? value : `%${value}%`;
        
        const sql = `
            SELECT 
                acc_types.id, 
                acc_types.accessory_name AS "accessoryName", 
                acc_types.stock AS "stock" 
            FROM acc_types
            WHERE acc_types.accessory_name ${isBulkSearch ? 'IN (:searchTerm)' : 'ILIKE :searchTerm'}
        `;

        try {
            const accessories = await sequelize.query(sql, {
                replacements: { isBulkSearch, searchTerm },
                type: sequelize.QueryTypes.SELECT
            });
    
            const response = accessories.map((accessory) => {
    
                const { id, accessoryName, stock } = accessory;
    
                return {
                    accessoryTypeId: id,
                    label: accessoryName,
                    value: accessoryName,
                    stock: stock,
                };
            })
    
            res.json(response);
        } catch (error) {
            logger.error('Error fetching assets:', error)
            console.error('Error fetching assets:', error);
            res.status(500).send({ error: error.message });
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

    async createAccessoryType(accessoryName, count, authId, transaction, remarks="") {
        // console.log("Creating Acc");

        const addAccTypeEventId = generateSecureID();

        const dateTimeNow = DateTime.now().setZone('Asia/Singapore').toJSDate();

        const accRow = await AccType.findOne({
            attributes: ["accessoryName"],
            where: { accessoryName }
        })

        // console.log(accRow);

        if (accRow) {
            throw new Error(`Accessory with name ${accessoryName} already exists.`);
        }

        await Event.create({
            id: addAccTypeEventId,
            eventDate: dateTimeNow, // TODO
            adminId: authId, // req.auth.id
        }, { transaction: this.transaction });

        const accType = await AccType.create({ 
            id: generateSecureID(), 
            accessoryName: accessoryName, 
            stock: count,
            addEventId: addAccTypeEventId
        }, { transaction });

        return accType;
    }

    // Method to reduce accessory count

    addAccessoriesEndpoint = async (req, res) => {
        const { accessories } = req.body;
        const transaction = await sequelize.transaction();
    
        try {
            for (const accessory of accessories) {

                let { accessoryTypeId, accessoryName, count, remarks } = accessory;

                const eventId = generateSecureID();
                const authId = req.auth.id

                const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

                await Event.create({
                    id: eventId,
                    eventDate: curDate,
                    adminId: authId,
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

                if (accessoryTypeId && accessoryTypeId !== "") {
                    const type = await this.getType(accessoryTypeId, { transaction });
                    type.stock += count;
                    await type.save({ transaction });
                } else {
                    // Ensure you await the call to createAccessoryType and pass the transaction
                    const accType = await this.createAccessoryType(accessoryName, count, req.auth.id, transaction);
                    accessoryTypeId = accType.id
                }
                
                if (count !== 0) {
                    await AccTxn.create({
                        id: generateSecureID(),
                        accessoryTypeId: accessoryTypeId,
                        count: count,
                        eventId: eventId
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