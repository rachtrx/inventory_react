const { sequelize, AssetType, AssetTypeVariant, Asset, AssetLoan, User, UserLoan, PeripheralType, Peripheral, Event, Remark, PeripheralLoan, Department, Loan  } = require('../models/postgres');
const { Op } = require('sequelize');
const FormHelpers = require('./formHelperController.js');
const logger = require('../logging.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const peripheralController = require('./peripheralController.js');
const path = require('path');
const fs = require('fs');   
const { omitUndefined } = require('mongoose');

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
            
                if (assetData.deleteEventId) {
                    throw new Error(`Asset Tag ${assetData.assetTag} is condemned!`);
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
                        
                        // IMPT ALLOW NEGATIVE PERIPHERAL COUNT!
                        // // Add count now
                        // peripheralCache[peripheral.id] = {
                        //     ...peripheralCache[peripheral.id], 
                        //     count: (peripheralCache[peripheral.id].available || 0) + peripheral.available
                        // };
                    }
                }
            }
            
            // IMPT ALLOW NEGATIVE PERIPHERAL COUNT!
            // // TOP UP MISSING PERIPHERALS
            // for (const peripheralData of Object.values(peripheralCache)) {
            //     const {peripheralType, count} = peripheralData;
            //     if (peripheralType.available < count) {
            //         await peripheralType.update({
            //             available: peripheralType.available + count
            //         }, { transaction });
            //     }
            // }

            const userLoans = {}

            // INSERTION
            for (const loan of loans) {
                const { asset, users, mode, loanDate } = loan;
                const expectedReturnDate = loan.expectedReturnDate === "" ? null : loan.expectedReturnDate;

                const loanId = generateSecureID() // PK for loan instance
                const loanEventId = generateSecureID() // Attribute of loan instance

                // Event, Remarks
                await Event.create({
                    id: loanEventId,
                    eventDate: loanDate,
                    adminId: req.auth.id,
                }, { transaction });

                await Loan.create({
                    id: loanId,
                    expectedReturnDate: expectedReturnDate,
                    loanEventId: loanEventId
                }, { transaction })

                if (asset.remarks !== '') await Remark.create({
                    id: generateSecureID(),
                    eventId: loanEventId,
                    remarks: asset.remarks
                }, { transaction });

                // Create Asset Loan
                await AssetLoan.create({
                    id: generateSecureID(),
                    loanId: loanId,
                    assetId: asset.assetId,
                }, { transaction });
                
                // User Loans for each user
                for (const user of users) {
                    const userLoan = await UserLoan.create({
                        id: generateSecureID(),
                        loanId: loanId,
                        userId: user.userId,
                    }, { transaction });
                    
                    // add loan to dictionary under user key to tag signature later
                    if (!userLoans[user.userId]) userLoans[user.userId] = [userLoan]
                    else userLoans[user.userId].push(userLoan);
                }

                // Peripheral Loans for each count of each type for each user
                if (asset.peripherals) {
                    for (const peripheral of asset.peripherals) {
                        for (let idx = 0; idx < peripheral.available; idx++) {
                            const newPeripheralOnLoan = await Peripheral.create({
                                id: generateSecureID(),
                                peripheralTypeId: peripheral.id
                            }, { transaction });

                            await PeripheralLoan.create({
                                id: generateSecureID(),
                                loanId: loanId,
                                peripheralId: newPeripheralOnLoan.id,
                            }, { transaction });
                        }
                        await peripheralCache[peripheral.id].update({
                            available: peripheralCache[peripheral.id].available - peripheral.count
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

        const ids = req.query.assetIds;

        try {
            const queries = ids.map(async (id) => {
                const query = await Asset.findOne({
                    attributes: ['id','serialNumber', 'assetTag'],
                    include: [
                        {
                            model: AssetTypeVariant,
                            attributes: ['variantName'],
                            include: {
                                model: AssetType,
                                attributes: ['assetType']
                            }
                        },
                        {
                            model: AssetLoan,
                            attributes: ['id'],
                            include: {
                                model: Loan,
                                attributes: ['expectedReturnDate'],
                                include: [{
                                    model: UserLoan,
                                    attributes: ['id'],
                                    include: {
                                        model: User,
                                        attributes: ['userName', 'id'],
                                        include: {
                                            model: Department,
                                            attributes: ['deptName']
                                        },
                                        required: true,
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
                                            attributes: ['name', 'id'],
                                        }
                                    },
                                    required: false,
                                }]
                            },
                        },
                    ],
                    where: { 
                        id: id
                    },
                });
        
                return query.createAssetObject(); 
            });
        
            // Use Promise.all to await all promises and get the array of results
            const assets = await Promise.all(queries);

            const assetsDict = assets.reduce((dict, asset) => {
                const { id, ...rest } = asset;
                dict[id] = rest;
              
                return dict;
            }, {});
        
            logger.info('Details for Assets:', assetsDict);
            res.json(assetsDict);

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
