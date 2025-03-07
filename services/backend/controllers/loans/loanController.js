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

class LoanController {

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
            const search = new UserAvailable(req.query)
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

    async scheduleLoan(req, res) {
        // logger.info(req.body);
        const { users } = req.body;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            const loanService = new LoanService(users, req.auth.id, transaction, false);
            // VALIDATION
            // GET all unique users and assets
            const { assetIdToSNMap, userIdToNameMap } = loanService.aggregateItems();
            await loanService.validateAssets(assetIdToSNMap);
            await loanService.validateUsers(userIdToNameMap);
            // INSERTION + Updating the Signatures
            await loanService.createScheduledLoans();
            await transaction.commit();

            return res.json({ message: 'All assets processed successfully.' });
        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    async loan (req, res) {
        // logger.info(req.body);
        const { users } = req.body;

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
            // await loanService.handleNewAccessories();
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
}

module.exports = new LoanController();
