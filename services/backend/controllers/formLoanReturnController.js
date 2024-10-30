const { sequelize, AstType, AstSType, Ast, AstLoan, Usr, UsrLoan, AccType, Event, Rmk, AccLoan, Dept, Loan  } = require('../models/postgres');
const FormHelpers = require('./formHelperController.js');
const logger = require('../logging.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');
const accessoryController = require('./accessoryController.js');
const path = require('path');
const { formTypes } = require('./utils.js');
const { createMap } = require('../utils/utils.js');
const LoanValidation = require('../services/LoanService.js');
const LoanService = require('../services/LoanService.js');
const ReturnService = require('../services/ReturnService.js');

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
            const loanService = new LoanService(loans, signatures, req.auth.id, transaction);
            // VALIDATION
            // GET all unique users and assets
            const { assetIdToTagMap, userIdToNameMap } = loanService.aggregateItems();
            await loanService.validateAssets(assetIdToTagMap);
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
                                    attributes: ['id', 'returnEventId'],
                                    include: {
                                        model: AccType,
                                        attributes: ['accessoryName', 'id'],
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
        const { returns } = req.body;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {

            const returnService = new ReturnService(returns, req.auth.id, transaction);

            await returnService.processReturns();
            await transaction.commit();

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
