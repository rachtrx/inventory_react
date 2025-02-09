const { sequelize, AstType, AstSType, Ast, AstLoan, Usr, AccType, Event, Rmk, AccLoan, Dept, Loan, AccReturn  } = require('../models/index.js');
const FormHelpers = require('./formHelperController.js');
const logger = require('../logging.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const accessoryController = require('./accessoryController.js');
const path = require('path');
const { createMap } = require('../utils/utils.js');
const LoanValidation = require('../services/LoanService.js');
const LoanService = require('../services/LoanService.js');
const ReturnService = require('../services/ReturnService.js');
const AssetDTO = require('../dtos/ast.dto.js');
const { model } = require('mongoose');
const LoanDTO = require('../dtos/loan.dto.js');
const AccessorySearch = require('../search_tools/accessory.js');
const { LoanSearch } = require('../search_tools/loanSearch.js');
const { UserReturnSearch } = require('../search_tools/userReturn.js');
const { AssetLoan } = require('../search_tools/assetLoan.js');
const { AssetReturn } = require('../search_tools/assetReturn.js');
const { AccReturnSearch } = require('../search_tools/accReturn.js');
const { AssetDelete } = require('../search_tools/AssetDelete.js');
const { UserLoan } = require('../search_tools/userLoan.js');
const { AccLoanSearch } = require('../search_tools/accLoan.js');
const { assetSearch } = require('../search_tools/AssetTag.js');

// req.file.filename, // Accessing the filename
// req.file.path,     // Accessing the full path
// req.file.size,     // Accessing the file size
// req.file.mimetype  // Accessing the MIME type

class FormLoanReturnController {

    async loan (req, res) {
        // logger.info(req.body);
        const { users } = req.body;

        let filePath = null;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            const loanService = new LoanService(users, req.auth.id, transaction);
            // VALIDATION
            // GET all unique users and assets
            const { assetIdToSNMap, userIdToNameMap } = loanService.aggregateItems();
            await loanService.validateAssets(assetIdToSNMap);
            await loanService.validateUsers(userIdToNameMap);
            // CREATE any new accessories
            await loanService.handleNewAccessories();
            // INSERTION + Updating the Signatures
            await loanService.createLoans();
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
        try {
            const search = new LoanSearch(req.query)
            const loans = search.runAll()

            return loans;
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadUserReturn (req, res) {
        try {
            const search = new UserReturnSearch(req.query)
            const loans = await search.run()
            loans.forEach(loan => {
                loan.value = loan.loanId;
                loan.label = loan.user.userName;
            });

            res.json(loans);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadAccReturn (req, res) {
        try {
            const search = new AccReturnSearch(req.query)
            const loans = await search.run()
            loans.forEach(loan => {
                loan.value = loan.loanId;
                loan.label = loan.accLoans.find(accLoan => accLoan.accType.isMatching)?.accType.accessoryName;
                loan.accLoans.sort((a, b) => {
                    // Sort by `isMatching` in descending order (true to the front)
                    return b.accType.isMatching - a.accType.isMatching;
                });
            })

            res.json(loans);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadAstReturn (req, res) {
        try {
            const search = new AssetReturn(req.query, false)
            const assets = await search.run()

            const loans = assets.flatMap(
                asset => {
                    const assetCopy = JSON.parse(JSON.stringify(asset));
                    delete assetCopy.astLoans;

                    if (!asset.astLoans || asset.astLoans.length === 0) { // simulate a loan structure
                        return [{
                            astLoan: {
                                asset: assetCopy
                            },
                            value: asset.serialNumber,
                            label: asset.serialNumber,
                            isDisabled: true
                        }];
                    } else {
                        const trueLoans = []
                        asset.astLoans.forEach(astLoan => { // IMPT since 1 to 1, can flatmap without worrying about duplicate assetLoan across assets
                            const loan = astLoan.loan;
                            delete astLoan.loan;
                            loan.astLoan = astLoan;
                            loan.astLoan.asset = assetCopy;

                            trueLoans.push({
                                ...loan,
                                value: loan.loanId,
                                label: asset.serialNumber,
                                isDisabled: loan.reserveEventId && !loan.loanEventId ? true : false // reserved but not loaned yet                            
                            })
                        })
                        return trueLoans
                    }
                }
            )
            console.log(loans);
            res.json(loans);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadAstLoan (req, res) {
        try {
            const search = new AssetLoan(req.query)
            const query = await search.run()

            const assets = query.map(
                asset => ({
                    ...asset,
                    value: asset.serialNumber,
                    label: asset.serialNumber,
                    isDisabled: asset.delEventId || asset.astLoans?.length > 0 ? true : false
                })
            )
            
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }
    async loadUsrLoan (req, res) {
        try {
            const search = new UserLoan(req.query)
            const query = await search.run()

            const users = query.map(
                user => ({
                        ...user,
                        value: user.userName,
                        label: user.userName,
                        isDisabled: user.delEventId ? true : false
                })
            )
            
            res.json(users);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }
    async loadAccLoan (req, res) {
        try {
            const search = new AccLoanSearch(req.query)
            const query = await search.run()

            const accessories = query.map(
                accessory => ({
                    ...accessory,
                    value: accessory.accessoryName,
                    label: accessory.accessoryName
                })
            )
            
            res.json(accessories);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadAstDel (req, res) {
        try {
            const search = new AssetDelete(req.query)
            const query = await search.run()

            const assets = query.map(
                asset => ({
                        ...asset,
                        value: asset.serialNumber,
                        label: asset.serialNumber,
                        isDisabled: asset.delEventId || !asset.astLoans || asset.astLoans.length === 0 ? false : true
                })
            )
            console.log(assets);
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadReturn (req, res) {

        const assetIds = req.query.assetIds;

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
                                attributes: ['expectedReturnDate', 'loanEventId'],
                                include: [
                                    {
                                        model: Usr,
                                        attributes: ['userName', 'id'],
                                        include: {
                                            model: Dept,
                                            attributes: ['deptName']
                                        },
                                        required: true,
                                    },
                                    {
                                        model: AccLoan,
                                        attributes: ['id', 'count'],
                                        include: [
                                            {
                                                model: AccType,
                                                attributes: ['accessoryName', 'id'],
                                            },
                                            {
                                                model: AccReturn,
                                                attributes: ['returnEventId', 'count'],
                                                required: false
                                            }
                                        ],
                                        required: false,
                                    }
                                ]
                            },
                        },
                    ],
                    where: { 
                        id: id
                    },
                });

                console.log(query);
        
                return new AssetDTO(query); 
            });
        
            // Use Promise.all to await all promises and get the array of results
            const assets = await Promise.all(queries);

            const assetsDict = assets.reduce((dict, asset) => {
                if (!asset.ongoingLoan) throw new Error(`No ongoing loan found for ${asset.serialNumber}`);

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
        const { returns } = req.body;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {

            const returnService = new ReturnService(returns, req.auth.id, transaction);

            await returnService.processReturns();
            await returnService.transaction.commit();

            return res.json({ message: 'All items returned successfully.' });
        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
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
