const { sequelize, AstType, AstSType, Ast, AstLoan, Usr, UsrLoan, AccType, Event, Rmk, AccLoan, Dept, Loan, AccReturn  } = require('../models/index.js');
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

        const assetIds = req.query.assetIds;

        try {
            const queries = ids.map(async (id) => {
                console.log(id);
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

    async getAccLoansForUser(req, res) {
        const userId = req.query.userId;

        try {
            const queries = loanIds.map(async (id) => {
                console.log(id);
                const query = await Loan.findOne({
                    attributes: ['expectedReturnDate', 'loanEventId'],
                    include: [
                        {
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
                        },
                        {
                            model: AstLoan,
                            attributes: ['id'],
                            where: { returnEventId: null },
                            include: {
                                model: Ast,
                                attributes: ['id','serialNumber', 'assetTag'],
                                include: {
                                    model: AstSType,
                                    attributes: ['subTypeName'],
                                    include: {
                                        model: AstType,
                                        attributes: ['typeName']
                                    }
                                },
                            },
                            required: false,
                        }
                    ],
                    where: { id }
                });

                console.log(query);

                if (!query.AccLoans && !query.AstLoan) throw new Error("No asset or accessories on loan")
        
                return new LoanDTO(query); 
            });
        
            // Use Promise.all to await all promises and get the array of results
            const loans = await Promise.all(queries);
            logger.info('Details for Assets:', loans);
            return loans.map(loan => new LoanDTO(loan));
        } catch (error) {
            console.error("Search failed:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    // Produces accessory options
    async searchAccessoriesOnLoan (req, res) {

        const { userId, searchTerm } = req.query;

        const sql = `
            WITH AccessoryLoanCounts AS (
                SELECT 
                    acc_loans.loan_id AS "loanId",
                    acc_loans.id AS "accLoanId",
                    acc_types.id,
                    acc_types.accessory_name AS "accessoryName",
                    (acc_loans.count - COALESCE(SUM(acc_returns.count), 0)) AS "unreturned",
                    JSON_BUILD_OBJECT(
                        'id', asts.id,
                        "serialNumber", asts.serial_number,
                        "assetTag", asts.asset_tag
                    ) AS "asset",
                    JSON_AGG(JSON_BUILD_OBJECT(
                        'id', usrs.id,
                        'username', usrs.userName
                    )) AS "users"
                FROM acc_loans
                LEFT JOIN acc_returns ON acc_loans.id = acc_returns.acc_loan_id
                LEFT JOIN acc_types ON acc_types.id = acc_loans.accessory_type_id
                LEFT JOIN loans ON acc_loans ON loans.id = acc_loans.loan_id
                LEFT JOIN ast_loans ON ast_loans.loan_id = loans.id
                LEFT JOIN asts ON ast_loans.asset_id = asts.id
                LEFT JOIN ast_s_types ON asts.sub_type_id = ast_s_types.id
                LEFT JOIN ast_types ON ast_s_types.asset_type_id = ast_types.id
                LEFT JOIN usrs ON usr_loans.user_id = usrs.id
                LEFT JOIN events AS loan_event ON loans.loan_event_id = loan_event.id
                WHERE loan_event.id IS NOT NULL
                AND (acc_loans.count - COALESCE(SUM(acc_returns.count), 0)) > 0
                ${searchTerm && ` AND acc_types.accessory_name ILIKE ${searchTerm}`}
                ${userId && ` AND users.id = ${userId}`}
                GROUP BY acc_types.id, acc_types.accessory_name, asts.id, acc_loans.id
            ),
            RelatedAccessoryLoans AS (
                SELECT
                    acl.loanId,
                    acl.accessoryName,
                    acl.unreturned,
                    acl.asset,
                    acl.users,
                    JSON_AGG(JSON_BUILD_OBJECT(
                        'id', ral.id,
                        'count', ral.count
                    )) AS "relatedAccLoans"
                FROM AccessoryLoanCounts acl
                LEFT JOIN acc_loans ral ON acl.loanId = ral.loan_id
                LEFT JOIN acc_returns ON acl.id = acc_returns.acc_loan_id
                LEFT JOIN acc_types ON acc_types.id = ral.accessory_type_id
                WHERE acl.accLoanId != ral.id
                AND (ral.count - COALESCE(SUM(acc_returns.count), 0)) > 0
                GROUP BY acl.loanId, acl.accessoryName, acl.unreturned, acl.asset, acl.users
            )
            SELECT *
            FROM RelatedAccessoryLoans
            LIMIT 20;
        `;

        try {
            const accLoans = await sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT
            });

            logger.info(accLoans);

            
    
            // const response = accLoans.map((accessory) => {
    
            //     const { id, accessoryName, stock } = accessory;
    
            //     return {
            //         accessoryTypeId: id,
            //         label: accessoryName,
            //         value: accessoryName,
            //         stock: stock,
            //     };
            // })
    
            res.json(response);
        } catch (error) {
            logger.error('Error fetching assets:', error)
            console.error('Error fetching assets:', error);
            res.status(500).send('Internal Server Error');
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
