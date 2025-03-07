const { AccLoan, Usr, Ast, AstLoan, Loan, AccReturn } = require("../models");
const { Op } = require('sequelize');

class ValidationService {

    constructor(transaction, authId) {
        this.transaction = transaction;
        this.authId = authId;
    }

    async run() {
        const items = await this.loadItems;
        return this.validate(items);
    }

    async getAccOnLoan(accLoanId, accName) {
        const accLoan = await AccLoan.findByPk(accLoanId, { 
            transaction: this.transaction,
            attributes: ['returnEventId'],
            include: {
                model: AccType,
                attributes: ['accessoryName'],
            }
        })
        if (!accLoan) throw new Error(`No record found for acc. loan ID: ${accLoanId}`);
        else if (accLoan.accessoryName !== accName) throw new Error(`Acc. name for acc. loan ID: ${accLoanId} is mismatched.`);

        return accLoan;
    }

    async getUser(userId, userName) {
        const user = await Usr.findByPk(userId, {
            transaction: this.transaction,
            include: {
                model: UsrDelete,
                include: {
                    model: Event,
                    where: { cancelled: { [Op.ne]: null }},
                    required: false,
                }
            },
        });
        if (!user) throw new Error(`No record found for User ID: ${userId}`);
        else if (user.userName !== userName) throw new Error(`Username for user ID: ${userId} mismatched ${userName}.`);
        
        if (user.UsrDeletes) {
            if (user.UsrDeletes.length > 0) {
                throw new Error(`Multiple delete entries (scheduled or completed) found!`);
            } else {
                const delEvent = user.UsrDeletes[0].Event;
                throw new Error(`User ${user.userName} is already ${delEvent.closedDate ? 'deleted' : 'scheduled to delete'}!`);
            }
        }

        return user;
    }

    async getAssetOnLoan(assetId, serialNumber) {
        const asset = await Ast.findByPk(assetId, {
            transaction: this.transaction,
            include: [
                {
                    model: AstDelete,
                    include: {
                        model: Event,
                        where: { cancelled: { [Op.ne]: null }},
                        required: false,
                    }
                },
                {
                    model: AstLoan,
                    attributes: ['id', 'loanId'],
                    required: false, // device is returned if not found
                    where: Sequelize.literal(`NOT EXISTS ( -- Get all returned astloan IDs
                        SELECT 1
                        FROM "ast_returns" AS "AstReturns"
                        JOIN "events" AS "AstReturns->Event" 
                            ON "AstReturns"."event_id" = "AstReturns->Event"."id" 
                            AND "AstReturns->Event"."cancelled" = FALSE
                            AND "AstReturns->Event"."closed_date" IS NOT NULL 
                        WHERE "AstReturns"."ast_loan_id" = "AstLoans"."id"
                        GROUP BY "AstReturns"."ast_loan_id"
                    )`),
                }
            ]
        });
        if (!asset) throw new Error(`No record found for Asset ID: ${assetId}`);
        if (asset.serialNumber !== serialNumber) throw new Error(`Mismatch for Asset ID: ${assetId}. Expected serialNumber: ${serialNumber}, but found: ${asset.serialNumber}`);

        if (asset.AstDeletes) {
            if (asset.AstDeletes.length > 0) {
                throw new Error(`Multiple delete entries (scheduled or completed) found!`);
            } else {
                const delEvent = asset.AstDeletes[0].Event;
                throw new Error(`Asset ${assetData.serialNumber} is already ${delEvent.closedDate ? 'condemned' : 'scheduled to condemn'}!`);
            }
        }
        return asset;
    }
    
}

module.exports = ValidationService;