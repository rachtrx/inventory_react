const { Asset, PeripheralType, User, PeripheralLoan, Loan, sequelize, VariantPeripheral, AssetTypePeripheral, AssetTypeVariant, AssetType, Peripheral, UserLoan, AssetLoan, Event } = require('../models/postgres');
const logger = require('../logging.js');
const { getAllOptions } = require('./utils.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');


class PeripheralController {

    updateAssetTypeSuggestion = async (req, res, next) => {
        try {
            const { assetId, peripheralId, saved } = req.body;
    
            // Fetch assetVariant with the related asset
            const assetVariant = await AssetTypeVariant.findOne({
                attributes: ['assetTypeId'],
                include: {
                    model: Asset,
                    attributes: ['id'],
                    where: { id: assetId },
                },
            });
    
            if (!assetVariant) {
                throw new Error('AssetTypeVariant not found');
            }
    
            // Find the related AssetTypePeripheral
            if (saved) {
                const assetTypePeripheral = await AssetTypePeripheral.findOne({
                    where: {
                        assetTypeId: assetVariant.assetTypeId,
                        peripheralId: peripheralId,
                    },
                });
        
                if (assetTypePeripheral) {
                    await assetTypePeripheral.destroy();
                    res.status(200).json({ message: 'Peripheral removed successfully' });
                } else {
                    throw new Error('No composite key found');
                }
            } else {
                await AssetTypePeripheral.create({
                    assetTypeId: assetVariant.assetTypeId,
                    peripheralId: peripheralId,
                });
                res.status(201).json({ message: 'Peripheral created successfully' });
            }
        } catch (error) {
            next(error);
        }
    };

    getSuggestedPeripherals = async (req, res) => {
        const { assetId } = req.body;

        let asset = await Asset.findOne({
            attributes: ['id'],
            include: {
                model: AssetTypeVariant,
                attributes: ['id'],
                include: [
                    {
                        model: VariantPeripheral,
                        attributes: ['peripheralTypeId'],
                        required: true,
                        include: {
                            model: PeripheralType,
                            attributes: ['id', 'name', 'count'],
                        },
                    },
                    {
                        model: AssetType,
                        attributes: ['id'],
                        required: true,
                        include: {
                            model: AssetTypePeripheral,
                            attributes: ['peripheralTypeId'],
                            required: true,
                            include: {
                                model: PeripheralType,
                                attributes: ['id', 'name', 'count'],
                            }
                        }
                    }
                ],
            },
            where: { id: assetId },
        })

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // Combine both arrays
        const peripheralsArr = [
            ...(asset?.AssetTypeVariant?.VariantPeripherals || []),
            ...(asset?.AssetTypeVariant?.AssetType?.AssetTypePeripherals || [])
        ];
    
        // Remove duplicates based on the peripheralTypeId
        const uniquePeripherals = peripheralsArr.filter((peripheral, index, self) =>
            index === self.findIndex((p) => p.PeripheralType.id === peripheral.PeripheralType.id)
        );
    
        // Map to the desired structure
        const peripherals = uniquePeripherals.map((match) => ({
            id: match.PeripheralType.id,
            peripheralName: match.PeripheralType.peripheralName,
            available: match.PeripheralType.available
        }));

        console.log(peripherals.slice(1, 10));
    
        res.status(200).json(peripherals);
    }

    getType = async (peripheralId, options = {}) => {
        return await PeripheralType.findOne({
            where: { id: peripheralId },
            ...options
        });
    }

    async getFilters (req, res) {
        const { field } = req.body;

        let options;
        try {
            if (field === 'peripheralName') {
                const meta = [PeripheralType, 'id', 'name'];
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

    async getPeripherals (req, res) {

        const { filters } = req.body
        logger.info(filters)

        const peripheralsExist = await PeripheralType.count();
        if (peripheralsExist === 0) {
            return res.json([]);
        }

        try {
            let query = await PeripheralType.findAll({
                attributes: ['id', 'name', 'count'],
                ...(filters.peripheralName.length > 0 && { where: { id: { [Op.in]: filters.peripheralName } } }),
                include: {
                    model: Peripheral,
                    attributes: ['id'],
                    include: [
                        {
                            model: PeripheralLoan,
                            where: { returnEventId: null },
                            attributes: ['id'],
                            include: {
                                model: UserLoan,
                                attributes: ['id'],
                                where: { cancelEventId: null },
                                include: [
                                    {
                                        model: User,
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
                                        model: AssetLoan,
                                        attributes: ['id'],
                                        required: false,
                                        include: {
                                            model: Asset,
                                            attributes: ['id', 'assetTag'],
                                        }
                                    },
                                ]
                            }
                            
                        },
                    ]
                },
                group: [
                    // PeripheralType attributes
                    '"PeripheralType"."id"',
                    '"PeripheralType"."name"',
                    '"PeripheralType"."count"',
                    // Peripheral attributes
                    '"Peripherals"."id"',
                    // PeripheralLoan attributes
                    '"Peripherals->PeripheralLoans"."id"',
                    '"Peripherals->PeripheralLoans->UserLoan"."id"',
                    '"Peripherals->PeripheralLoans->UserLoan->User"."id"',
                    '"Peripherals->PeripheralLoans->UserLoan->User"."user_name"',
                    '"Peripherals->PeripheralLoans->UserLoan->User"."bookmarked"',
                    '"Peripherals->PeripheralLoans->UserLoan->LoanEvent"."id"',
                    '"Peripherals->PeripheralLoans->UserLoan->ReserveEvent"."id"',
                    '"Peripherals->PeripheralLoans->UserLoan->LoanEvent"."event_date"',
                    '"Peripherals->PeripheralLoans->UserLoan->ReserveEvent"."event_date"',
                    '"Peripherals->PeripheralLoans->UserLoan->AssetLoan"."id"',
                    '"Peripherals->PeripheralLoans->UserLoan->AssetLoan->Asset"."id"',
                    '"Peripherals->PeripheralLoans->UserLoan->AssetLoan->Asset"."asset_tag"',
                ],
                order: [['updatedAt', 'DESC']],
            });

            const result = query.map(peripheralType => {
                return peripheralType.createPeripheralTypeObject();
            });
    
            logger.info(result);
            res.json(result);
        } catch (error) {
            logger.error(error)
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }

    async searchPeripherals (req, res) {
        const { value } = req.body;

        const isBulkSearch = Array.isArray(value) ? true : false;
        const searchTerm = isBulkSearch ? value : `%${value}%`;
        
        const sql = `
            SELECT 
                peripheral_types.id, 
                peripheral_types.peripheral_name AS "peripheralName", 
                peripheral_types.available AS "available" 
            FROM peripheral_types
            WHERE peripheral_types.peripheral_name ${isBulkSearch ? 'IN (:searchTerm)' : 'ILIKE :searchTerm'}
        `;

        try {
            const peripherals = await sequelize.query(sql, {
                replacements: { isBulkSearch, searchTerm },
                type: sequelize.QueryTypes.SELECT
            });
    
            const response = peripherals.map((peripheral) => {
    
                const { id, name, available } = peripheral;
    
                return {
                    value: id,
                    label: name,
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

    async createPeripheralType(peripheralName, count, transaction) {
        console.log("Creating Peripheral");
        return await PeripheralType.create({ 
            id: generateSecureID(), 
            name: peripheralName, 
            count: count 
        }, { transaction });
    }

    async addPeripheral (peripheralTypeId, count) {
        const type = await PeripheralType.findByPk(peripheralTypeId);
        type.available += count;
        await type.save();
        return type;
    };

// Helper function to attach a peripheral to an asset
    async loanPeripheral (loanId, peripheralTypeId) {
        let type = await this.getType(peripheralTypeId);

        if (type && type.available <= 0) {
            throw new Error('Peripheral type not available');
        }

        if (!type) { // TODO check for the name first?
            type = this.createPeripheralType(peripheralTypeId, 1);
        }

        const newPeripheral = PeripheralLoan.build({
            loanId: loanId,
            peripheralTypeId: type.id
        });

        type.available -= 1;
        await type.save();

        return newPeripheral;
    };

    // Method to reduce peripheral count
    async reducePeripheralCount(peripheralTypeId, count) {
        const type = await PeripheralType.findByPk(peripheralTypeId);

        if (!type || type.available < count) {
            throw new Error('Not enough peripherals available to reduce');
        }

        // Reduce the available count
        type.available -= count;
        await type.save();

        return { message: `${count} peripherals reduced successfully` };
    }

    addPeripheralsEndpoint = async (req, res) => {
        const { peripherals } = req.body;
        const transaction = await sequelize.transaction();
    
        try {
            for (const peripheral of peripherals) {
                if (peripheral.id !== peripheral.peripheralName) {
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
    //         const peripheralType = await PeripheralType.findByPk(id);
    //         if (peripheralType) {
    //             peripheralType.bookmarked = bookmarked === true ? 1 : 0;
    //             await peripheralType.save();
    //             res.json({ message: "Bookmark updated successfully" });
    //         } else {
    //             res.status(404).json({ message: "Peripheral Type not found" });
    //         }
    //     } catch (error) {
    //         console.error('Error updating Peripheral Type:', error);
    //         res.status(500).send('Internal Server Error');
    //     }
    // };
};

module.exports = new PeripheralController();