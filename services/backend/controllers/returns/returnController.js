const { sequelize, AstType, AstSType, Ast, AstLoan, Usr, AccType, Event, Rmk, AccLoan, Dept, Loan, AccReturn  } = require('../../models/index.js');
const FormHelpers = require('../formHelperController.js');
const logger = require('../../logging.js');
const { generateSecureID } = require('../../utils/nanoidValidation.js');
const accessoryController = require('../accessories/accessoryController.js');
const path = require('path');
const { createMap } = require('../../utils/utils.js');
const LoanValidation = require('../../services/LoanService.js');
const LoanService = require('../../services/LoanService.js');
const ReturnService = require('../../services/ReturnService.js');
const AssetDTO = require('../../dtos/ast.dto.js');
const { model } = require('mongoose');
const LoanDTO = require('../../dtos/loan.dto.js');
const AccessorySearch = require('../../search_tools/accessory.js');
const { LoanSearch } = require('../../search_tools/loanSearch.js');
const { UserReturnSearch } = require('../../search_tools/userReturn.js');
const { AssetLoan } = require('../../search_tools/assetLoan.js');
const { AssetReturn } = require('../../search_tools/assetReturn.js');
const { AccReturnSearch } = require('../../search_tools/accReturn.js');
const { AssetDelete } = require('../../search_tools/AssetDelete.js');
const { UserAvailable } = require('../../search_tools/userAvailable.js');
const { AccLoanSearch } = require('../../search_tools/accLoan.js');
const { assetSearch } = require('../../search_tools/AssetTag.js');

// req.file.filename, // Accessing the filename
// req.file.path,     // Accessing the full path
// req.file.size,     // Accessing the file size
// req.file.mimetype  // Accessing the MIME type

class ReturnController {

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
            console.log(loans);
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
            console.log(loans);
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
            // console.log(loans);
            res.json(loans);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }
    
    async return_ (req, res) {
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

    async scheduleReturn (req, res) {
        const { returns, expectedDate } = req.body;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            const returnService = new ReturnService(returns, req.auth.id, transaction);
            await returnService.processReturns(expectedDate);
            await returnService.transaction.commit();
            return res.json({ message: 'All items returned successfully.' });
        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    };
}

module.exports = new ReturnController();
