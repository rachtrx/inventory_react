const { Ast, AccType, Usr, AccLoan, Loan, sequelize, AstSTypeAcc, AstTypeAcc, AstSType, AstType, Acc, UsrLoan, AstLoan, Event } = require('../models/postgres/index.js');
const logger = require('../logging.js');
const { getAllOptions } = require('./utils.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');


class PeripheralController {

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
        // const uniquePeripherals = peripheralsArr.filter((peripheral, index, self) =>
        //     index === self.findIndex((p) => p.AccType.id === peripheral.AccType.id)
        // );
    
        // // Map to the desired structure
        // const peripherals = uniquePeripherals.map((match) => ({
        //     id: match.AccType.id,
        //     accessoryName: match.AccType.accessoryName,
        //     available: match.AccType.available
        // }));

        // console.log(peripherals.slice(1, 10));
    
        res.status(200).json({ message: 'Acc created successfully' });
    }

    getType = async (peripheralId, options = {}) => {
        return await AccType.findOne({
            where: { id: peripheralId },
            ...options
        });
    }

    async getFilters (req, res) {
        const { field } = req.body;

        let options;
        try {
            if (field === 'accessoryName') {
                const meta = [AccType, 'id', 'accessoryName'];
                options = await getAllOptions(meta);
            }
            
            return res.json(options || [])
            
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
        return
    }

    async getAccesories (req, res) {

        const { filters } = req.body
        logger.info(filters)

        const peripheralsExist = await AccType.count();
        if (peripheralsExist === 0) {
            return res.json([]);
        }

        try {
            let query = await AccType.findAll({
                attributes: ['id', 'name', 'count'],
                ...(filters.accessoryName.length > 0 && { where: { id: { [Op.in]: filters.accessoryName } } }),
                include: {
                    model: Acc,
                    attributes: ['id'],
                    include: [
                        {
                            model: AccLoan,
                            where: { returnEventId: null },
                            attributes: ['id'],
                            include: {
                                model: UsrLoan,
                                attributes: ['id'],
                                where: { cancelEventId: null },
                                include: [
                                    {
                                        model: Usr,
                                        attributes: ['id', 'userName', 'bookmarked'],
                                    },
                                    {
                                        model: Event,
                                        as: 'ReserveEvent',
                                        attributes: ['eventDate'],
                                        required: false,
                                    },
                                    {
                                        model: Event,
                                        as: 'LoanEvent',
                                        attributes: ['eventDate'],
                                        required: false,
                                    },
                                    {
                                        model: AstLoan,
                                        attributes: ['id'],
                                        required: false,
                                        include: {
                                            model: Ast,
                                            attributes: ['id', 'assetTag'],
                                        }
                                    },
                                ]
                            }
                            
                        },
                    ]
                },
                group: [
                    // AccType attributes
                    '"AccType"."id"',
                    '"AccType"."name"',
                    '"AccType"."count"',
                    // Acc attributes
                    '"Peripherals"."id"',
                    // AccLoan attributes
                    '"Peripherals->PeripheralLoans"."id"',
                    '"Peripherals->PeripheralLoans->UsrLoan"."id"',
                    '"Peripherals->PeripheralLoans->UsrLoan->Usr"."id"',
                    '"Peripherals->PeripheralLoans->UsrLoan->Usr"."user_name"',
                    '"Peripherals->PeripheralLoans->UsrLoan->Usr"."bookmarked"',
                    '"Peripherals->PeripheralLoans->UsrLoan->LoanEvent"."id"',
                    '"Peripherals->PeripheralLoans->UsrLoan->ReserveEvent"."id"',
                    '"Peripherals->PeripheralLoans->UsrLoan->LoanEvent"."event_date"',
                    '"Peripherals->PeripheralLoans->UsrLoan->ReserveEvent"."event_date"',
                    '"Peripherals->PeripheralLoans->UsrLoan->AstLoan"."id"',
                    '"Peripherals->PeripheralLoans->UsrLoan->AstLoan->Ast"."id"',
                    '"Peripherals->PeripheralLoans->UsrLoan->AstLoan->Ast"."asset_tag"',
                ],
                order: [['updatedAt', 'DESC']],
            });

            const result = query.map(accType => {
                return accType.createAccessoryTypeObject();
            });
    
            logger.info(result);
            res.json(result);
        } catch (error) {
            logger.error(error)
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }

    async searchAccessories (req, res) {
        const { value } = req.body;

        const isBulkSearch = Array.isArray(value) ? true : false;
        const searchTerm = isBulkSearch ? value : `%${value}%`;
        
        const sql = `
            SELECT 
                acc_types.id, 
                acc_types.accessory_name AS "accessoryName", 
                acc_types.available AS "available" 
            FROM acc_types
            WHERE acc_types.accessory_name ${isBulkSearch ? 'IN (:searchTerm)' : 'ILIKE :searchTerm'}
        `;

        try {
            const accessories = await sequelize.query(sql, {
                replacements: { isBulkSearch, searchTerm },
                type: sequelize.QueryTypes.SELECT
            });
    
            const response = accessories.map((accessory) => {
    
                const { id, accessoryName, available } = accessory;
    
                return {
                    value: id,
                    label: accessoryName,
                    available: available,
                };
            })
    
            res.json(response);
        } catch (error) {
            logger.error('Error fetching assets:', error)
            console.error('Error fetching assets:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async createPeripheralType(accessoryName, count, transaction) {
        console.log("Creating Acc");
        return await AccType.create({ 
            id: generateSecureID(), 
            accessoryName: accessoryName, 
            available: count 
        }, { transaction });
    }

    async addPeripheral (peripheralTypeId, count) {
        const type = await AccType.findByPk(peripheralTypeId);
        type.available += count;
        await type.save();
        return type;
    };

// Helper function to attach a peripheral to an asset
    async loanPeripheral (loanId, peripheralTypeId) {
        let type = await this.getType(peripheralTypeId);

        if (type && type.available <= 0) {
            throw new Error('Acc type not available');
        }

        if (!type) { // TODO check for the name first?
            type = this.createPeripheralType(peripheralTypeId, 1);
        }

        const newPeripheral = AccLoan.build({
            loanId: loanId,
            peripheralTypeId: type.id
        });

        type.available -= 1;
        await type.save();

        return newPeripheral;
    };

    // Method to reduce peripheral count
    async reducePeripheralCount(peripheralTypeId, count) {
        const type = await AccType.findByPk(peripheralTypeId);

        if (!type || type.available < count) {
            throw new Error('Not enough peripherals available to reduce');
        }

        // Reduce the available count
        type.available -= count;
        await type.save();

        return { message: `${count} peripherals reduced successfully` };
    }

    addAccessoriesEndpoint = async (req, res) => {
        const { peripherals } = req.body;
        const transaction = await sequelize.transaction();
    
        try {
            for (const peripheral of peripherals) {
                if (peripheral.id !== peripheral.accessoryName) {
                    const type = await this.getType(peripheral.id, { transaction });
                    type.available += peripheral.count;
                    await type.save({ transaction });
                } else {
                    // Ensure you await the call to createPeripheralType and pass the transaction
                    await this.createPeripheralType(peripheral.id, peripheral.count, transaction);
                }
            }
            await transaction.commit(); // Commit only after all peripherals are processed
            res.status(201).json({ message: "Peripherals added successfully" });
        } catch (error) {
            logger.error(error);
            await transaction.rollback(); // Rollback if any error occurs
            res.status(500).json({ error: error.message });
        }
    }

    // Endpoint to reduce peripheral count
    async reducePeripheralCountEndpoint(req, res) {
        const { peripheralTypeId, count } = req.body;
        try {
            const result = await this.reducePeripheralCount(peripheralTypeId, count);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
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

module.exports = new PeripheralController();