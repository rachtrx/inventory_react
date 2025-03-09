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
        });
        if (!user) throw new Error(`No record found for User ID: ${userId}`);
        else if (user.userName !== userName) throw new Error(`Username for user ID: ${userId} mismatched ${userName}.`);
        
        return user;
    }
    
}

module.exports = ValidationService;