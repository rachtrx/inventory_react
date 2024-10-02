const { sequelize, AssetType, AssetTypeVariant, Asset, AssetLoan, User, UserLoan, PeripheralType, Peripheral, Event, Remark, PeripheralLoan  } = require('../models/postgres');
const { Op } = require('sequelize');
const FormHelpers = require('./formHelperController.js');
const logger = require('../logging.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const peripheralController = require('./peripheralController.js');
const path = require('path');
const fs = require('fs');   

// req.file.filename, // Accessing the filename
// req.file.path,     // Accessing the full path
// req.file.size,     // Accessing the file size
// req.file.mimetype  // Accessing the MIME type

class FormLoanReturnController {

    async loan (req, res) {
        // logger.info(req.body);
        const { loans, signatures } = req.body;

        let filePath = null;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            // VALIDATION
            // GET all unique users and assets
            const uniqueUserIds = new Set();
            const uniqueAssetIds = new Set();

            // Collect unique asset and user IDs
            loans.forEach(loan => {
                uniqueAssetIds.add(loan.asset.assetId);
                loan.users.forEach(user => uniqueUserIds.add(user.userId));
            });

            // Fetch and validate all unique assets in parallel
            const assetsData = await Promise.all(
                [...uniqueAssetIds].map(assetId => Asset.findByPk(assetId, { transaction }))
            );

            // Fetch and validate all unique users in parallel
            const usersData = await Promise.all(
                [...uniqueUserIds].map(userId => User.findByPk(userId, { transaction }))
            );

            // VALIDATE all unique users and assets
            await Promise.all(assetsData.map(async (assetData, index) => {
                if (!assetData) {
                    throw new Error(`Asset with ID ${[...uniqueAssetIds][index]} not found!`); // TODO CONVERT TO TAG
                }
            
                if (!assetData.shared) {
                    // Check if the asset is already on loan
                    const isOnLoan = await Asset.findOne({
                        include: {
                            model: AssetLoan,
                            attributes: [],
                            required: true,
                            where: { returnEventId: { [Op.eq]: null } }
                        },
                        where: { id: assetData.id },
                        transaction
                    });
            
                    if (isOnLoan) {
                        throw new Error(`Asset with ID ${assetData.assetTag} is still on loan!`);
                    }
                }
            
                if (assetData.deleteEventId) {
                    throw new Error(`Asset with ID ${assetData.assetTag} is condemned!`);
                }
            }));

            usersData.forEach((userData, index) => {
                if (!userData) {
                    throw new Error(`User with ID ${[...uniqueUserIds][index]} not found.`);
                }
                if (userData.deleteEventId) {
                    throw new Error(`User with ID ${userData.userId} is deleted.`);
                }
            });
            
            // CREATE any new peripherals
            const newPeripherals = {}; // tracks <newPeripheralName>: <newPeripheralId>
            const peripheralCache = {}; // tracks <peripheralId>: <peripheralTypeObject>
            for (const loan of loans) {
                if (loan.asset.peripherals) {
                    for (const peripheral of loan.asset.peripherals) {
                        let peripheralType;
                        // id === name means new. Check if added to newPeripherals already
                        if (peripheral.id === peripheral.peripheralName && !newPeripherals[peripheral.peripheralName]) {
                            peripheralType = await peripheralController.createPeripheralType(
                                peripheral.peripheralName,
                                0,
                                transaction
                            );
                            newPeripherals[peripheral.peripheralName] = peripheralType.id;
                            peripheral.id = peripheralType.id;
                            peripheralCache[peripheral.id] = peripheralType; // Setup, add count later
                        } else if (peripheral.id === peripheral.peripheralName) {
                            // if new but added to newPeripherals already, just need to update the id
                            peripheral.id = newPeripherals[peripheral.peripheralName];
                        } else if (!peripheralCache[peripheral.id]) {
                            // Get existing peripheral type if not found yet and update cache
                            peripheralType = await PeripheralType.findByPk(peripheral.id, {transaction});
                            peripheralCache[peripheral.id] = peripheralType; // Setup, add count later
                        }
                        
                        // // Add count now
                        // peripheralCache[peripheral.id] = {
                        //     ...peripheralCache[peripheral.id], 
                        //     count: (peripheralCache[peripheral.id].count || 0) + peripheral.count
                        // };
                    }
                }
            }
            
            // // TOP UP MISSING PERIPHERALS → Nevermind, just allow negative
            // for (const peripheralData of Object.values(peripheralCache)) {
            //     const {peripheralType, count} = peripheralData;
            //     if (peripheralType.availableCount < count) {
            //         await peripheralType.update({
            //             availableCount: peripheralType.availableCount + count
            //         }, { transaction });
            //     }
            // }

            logger.info(loans)

            const userLoans = {}

            // INSERTION
            for (const loan of loans) {
                const { asset, users, mode, loanDate } = loan;
                const expectedReturnDate = loan.expectedReturnDate === "" ? null : loan.expectedReturnDate;

                const loanEventId = generateSecureID()

                // Event, Remarks
                await Event.create({
                    id: loanEventId,
                    adminId: req.auth.id,
                    eventDate: loanDate
                }, { transaction });

                if (asset.remarks !== '') await Remark.create({
                    id: generateSecureID(),
                    eventId: loanEventId,
                    remarks: asset.remarks
                }, { transaction });
                
                // Asset Loans and User Loans for each user
                const userLoanIds = {}
                for (const user of users) {
                    const userLoanId = generateSecureID()
                    const userLoan = await UserLoan.create({
                        id: userLoanId,
                        userId: user.userId,
                        loanEventId: loanEventId,
                        expectedReturnDate: expectedReturnDate
                    }, { transaction });
                    
                    if (!userLoans[user.userId]) userLoans[user.userId] = [userLoan]
                    else userLoans[user.userId].push(userLoan);
                    
                    await AssetLoan.create({
                        id: generateSecureID(),
                        userLoanId: userLoanId,
                        assetId: asset.assetId,
                    }, { transaction });
                    userLoanIds[user.userId] = userLoanId;
                }

                // Peripheral Loans for each count of each type for each user
                if (asset.peripherals) {
                    for (const peripheral of asset.peripherals) {
                        for (let idx = 0; idx < peripheral.count; idx++) {
                            const newPeripheralOnLoan = await Peripheral.create({
                                id: generateSecureID(),
                                peripheralTypeId: peripheral.id
                            }, { transaction });

                            for (const user of users) {
                                await PeripheralLoan.create({
                                    id: generateSecureID(),
                                    userLoanId: userLoanIds[user.userId],
                                    peripheralId: newPeripheralOnLoan.id,
                                }, { transaction });
                            }
                        }
                        await peripheralCache[peripheral.id].update({
                            availableCount: peripheralCache[peripheral.id].availableCount - peripheral.count
                        }, { transaction });
                    }
                }
            }

            // Updating the Signatures
            if (signatures) {
                for (const [userId, signature] of Object.entries(signatures)) {
                    const base64Data = signature.replace(/^data:image\/png;base64,/, '');
                    const fileName = `${Date.now()}-${userId}-signature.png`;
                    const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
                    filePath = path.join(uploadsDir, 'signatures', fileName);
    
                    await fs.promises.writeFile(filePath, base64Data, 'base64');
    
                    for (const userLoan of userLoans[userId]) {
                        await userLoan.update({
                            filepath: filePath
                        }, { transaction });
                    }
                }
            }

            // Commit the transaction
            await transaction.commit();

            return res.json({ message: 'All assets processed successfully.' });
        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    async loadReturn (req, res) {

        const id = req.query.field;

        try {
            for (const id of ids) {
                let query = await Asset.findOne({
                    attributes: ['serialNumber', 'assetTag'],
                    include: [
                        {
                            model: AssetLoan,
                            attributes: ['id'],
                            include: [
                                {
                                    model: UserLoan,
                                    attributes: ['expectedReturnDate'],
                                    include: [
                                        {
                                            model: User,
                                            attributes: ['userName'],
                                            include: {
                                                model: Department,
                                                attributes: ['deptName']
                                            }
                                        },
                                        {
                                            model: PeripheralLoan,
                                            attributes: ['returnEventId'],
                                            include: {
                                                model: Peripheral,
                                                attributes: ['id'],
                                                include: {
                                                    model: PeripheralType,
                                                    attributes: ['peripheralName']
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    model: AssetTypeVariant,
                                    attributes: ['variantName'],
                                    include: {
                                        model: AssetType,
                                        attributes: ['assetType']
                                    }
                                }
                            ],
                        },
                        
                    ],
                    where: { 
                        id: id
                    },
                })
            }

            const asset = query.createAssetObject()
            logger.info('Details for Asset:', asset);
    
            res.json(asset);

        } catch (error) {
            console.error("Search failed:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    
    async return (req, res) {
        const filePath = req.file ? req.file.path : null;
        const userId = req.body.userId;
        const assetId = req.body.assetId;
    
        // TODO i think not needed bc filefilter alr checks...
        if (!filePath && req.fileValidationError) {
            return res.status(400).json({ error: 'Only PDF files are allowed!' });
        }
    
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const asset = await Asset.findById(assetId).session(session);
            if (!asset) {
                return res.status(400).json({ error: "Asset not found!" });
            }
            if (asset.status !== "loaned") {
                return res.status(400).json({ error: "Asset is not on loan!" });
            }
            await FormHelpers.insertAssetEvent(generateSecureID(), assetId, 'returned', req.body.remarks, userId, null, filePath, session);
            await FormHelpers.updateStatus(assetId, 'available', userId, session);
    
            await session.commitTransaction();
            session.endSession();
    
            return res.json({ message: 'All assets processed successfully.' }); 
            // res.json({ lastProcessedAssetId: assets[assets.length - 1].assetId }); // TODO IMPT did i just submit a single device as an array itself?
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    };
    
    async downloadEvent (req, res) {
        const id = req.body.id;
    
        try {
            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).send('File not found.');
            }
    
            const filePath = path.join(uploadPath, event.filePath);
            console.log(filePath);
    
            res.download(filePath, event.filePath, { headers: { 'Content-Type': 'application/pdf' } });
        } catch (error) {
            console.error("Error downloading file:", error);
            res.status(500).send('Internal Server Error');
        }
    };
}

module.exports = new FormLoanReturnController();
