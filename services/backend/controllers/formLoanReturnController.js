const { sequelize, AstType, AstSType, Ast, AstLoan, Usr, UsrLoan, AccType, Acc, Event, Rmk, AccLoan, Dept, Loan  } = require('../models/postgres');
const { Op } = require('sequelize');
const FormHelpers = require('./formHelperController.js');
const logger = require('../logging.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const accessoryController = require('./accessoryController.js');
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
                [...uniqueAssetIds].map(assetId => Ast.findByPk(assetId, { transaction }))
            );

            // Fetch and validate all unique users in parallel
            const usersData = await Promise.all(
                [...uniqueUserIds].map(userId => Usr.findByPk(userId, { transaction }))
            );

            // VALIDATE all unique users and assets
            await Promise.all(assetsData.map(async (assetData, index) => {
                if (!assetData) {
                    throw new Error(`Ast with ID ${[...uniqueAssetIds][index]} not found!`); // TODO CONVERT TO TAG
                }
            
                const isOnLoan = await Ast.findOne({
                    include: {
                        model: AstLoan,
                        attributes: [],
                        required: true,
                        where: { returnEventId: { [Op.eq]: null } }
                    },
                    where: { id: assetData.id },
                    transaction
                });
        
                if (isOnLoan) {
                    throw new Error(`Ast with ID ${assetData.assetTag} is still on loan!`);
                }
            
                if (assetData.delEventId) {
                    throw new Error(`Ast Tag ${assetData.assetTag} is condemned!`);
                }
            }));

            usersData.forEach((userData, index) => {
                if (!userData) {
                    throw new Error(`Usr with ID ${[...uniqueUserIds][index]} not found.`);
                }
                if (userData.delEventId) {
                    throw new Error(`Usr with ID ${userData.userId} is deleted.`);
                }
            });
            
            // CREATE any new accessories
            const newAccessories = {}; // tracks <newPeripheralName>: <newPeripheralId>
            const accessoryCache = {}; // tracks <peripheralId>: <peripheralTypeObject>
            for (const loan of loans) {
                if (loan.asset.accessories) {
                    for (const accessory of loan.asset.accessories) {
                        let accType;

                        // id === name means new. Check if added to newAccessories already
                        if (accessory.accessoryTypeId === accessory.accessoryName && !newAccessories[accessory.accessoryName]) {
                            accType = await accessoryController.createPeripheralType(
                                accessory.accessoryName,
                                0,
                                transaction
                            );
                            accessoryCache[accType.id] = accType;
                            newAccessories[accessory.accessoryName] = accType.id;
                            accessory.accessoryTypeId = accType.id;
                        } else if (accessory.accessoryTypeId === accessory.accessoryName) {
                            // if new but added to newAccessories already, just need to update the id
                            accessory.accessoryTypeId = newAccessories[accessory.accessoryName];
                        } else if (!accessoryCache[accessory.accessoryTypeId]) {
                            // Get existing accessory type if not found yet and update cache
                            accType = await AccType.findByPk(accessory.accessoryTypeId, {transaction});
                            accessoryCache[accType.id] = accType;
                        }
                    }
                }
            }

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

                if (asset.remarks !== '') await Rmk.create({
                    id: generateSecureID(),
                    eventId: loanEventId,
                    remarks: asset.remarks
                }, { transaction });

                // Create Ast Loan
                await AstLoan.create({
                    id: generateSecureID(),
                    loanId: loanId,
                    assetId: asset.assetId,
                }, { transaction });
                
                // Usr Loans for each user
                for (const user of users) {
                    const userLoan = await UsrLoan.create({
                        id: generateSecureID(),
                        loanId: loanId,
                        userId: user.userId,
                    }, { transaction });
                    
                    // add loan to dictionary under user key to tag signature later
                    if (!userLoans[user.userId]) userLoans[user.userId] = [userLoan]
                    else userLoans[user.userId].push(userLoan);
                }

                // Acc Loans for each count of each type for each user
                if (asset.accessories) {
                    for (const accessory of asset.accessories) {
                        for (let idx = 0; idx < accessory.count; idx++) {
                            const createdAccessory = await Acc.create({
                                id: generateSecureID(),
                                accessoryTypeId: accessory.accessoryTypeId
                            }, { transaction });

                            await AccLoan.create({
                                id: generateSecureID(),
                                loanId: loanId,
                                accessoryId: createdAccessory.id,
                            }, { transaction });
                        }
                        await accessoryCache[accessory.accessoryTypeId].update({
                            available: accessoryCache[accessory.accessoryTypeId].available - accessory.count
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
                const query = await Ast.findOne({
                    attributes: ['id','serialNumber', 'assetTag'],
                    include: [
                        {
                            model: AstSType,
                            attributes: ['subTypeName'],
                            include: {
                                model: AstType,
                                attributes: ['typeName']
                            }
                        },
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            where: { returnEventId: null },
                            include: {
                                model: Loan,
                                attributes: ['expectedReturnDate'],
                                include: [{
                                    model: UsrLoan,
                                    attributes: ['id'],
                                    include: {
                                        model: Usr,
                                        attributes: ['userName', 'id'],
                                        include: {
                                            model: Dept,
                                            attributes: ['deptName']
                                        },
                                        required: true,
                                    }
                                },
                                {
                                    model: AccLoan,
                                    attributes: ['returnEventId'],
                                    include: {
                                        model: Acc,
                                        attributes: ['id'],
                                        include: {
                                            model: AccType,
                                            attributes: ['accessoryName', 'id'],
                                        },
                                        required: true, // TODO CHECK IF ANY ISSUE IF NO ACC
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
                const { assetId, ...rest } = asset;
                dict[assetId] = rest;
              
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
            const asset = await Ast.findById(assetId).session(session);
            if (!asset) {
                return res.status(400).json({ error: "Ast not found!" });
            }
            if (asset.status !== "loaned") {
                return res.status(400).json({ error: "Ast is not on loan!" });
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
