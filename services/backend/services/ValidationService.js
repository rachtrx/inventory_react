const { formTypes } = require("../controllers/utils");
const { AccLoan, Usr, UsrLoan, Ast, AstLoan, Loan, AccReturn } = require("../models");
const { Op } = require('sequelize');

class ValidationService {

    constructor(transaction, authId, formType) {
        this.transaction = transaction;
        this.formType = formType;
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
        });
        if (!user) throw new Error(`No record found for User ID: ${userId}`);
        else if (user.userName !== userName) throw new Error(`Username for user ID: ${userId} mismatched ${userName}.`);
        
        return user;
    }

    async getAsset(assetId, assetTag) {
        const asset = await Ast.findByPk(assetId, {
            transaction: this.transaction,
            include: {
                model: AstLoan,
                attributes: ['id', 'loanId'],
                where: { returnEventId: { [Op.eq]: null } }, // find the loaned device
                required: false, // device is returned if not found
                include: {
                    model: Loan,
                    attributes: ['id', 'loanEventId'],
                    ...(this.formType === formTypes.RETURN && {
                        include: [
                            {
                                model: UsrLoan,
                                attributes: ['userId']
                            },
                            {
                                model: AccLoan,
                                attributes: ['id', 'accessoryTypeId', 'count'],
                                include: {
                                    model: AccReturn,
                                    attributes: ['count'],
                                    where: { returnEventId: { [Op.eq]: null } },
                                    required: false,
                                },
                                required: false,
                            }
                        ]
                    })
                }
            }
        });
        if (!asset) throw new Error(`No record found for Asset ID: ${assetId}`);
        if (asset.assetTag !== assetTag) throw new Error(`Mismatch for Asset ID: ${assetId}. Expected assetTag: ${assetTag}, but found: ${asset.assetTag}`);

        if (asset.delEventId) {
            throw new Error(`Asset Tag ${assetData.assetTag} is condemned!`);
        }
    
        const onLoan = asset.AstLoans && asset.AstLoans.length > 0;

        if (onLoan && this.formType === formTypes.LOAN) {
            throw new Error(`Asset with ID ${asset.assetTag} is still on loan!`);
        } else if (!onLoan && this.formType === formTypes.RETURN) {
            throw new Error(`Asset with ID ${asset.assetTag} is not on loan!`);
        }

        return asset;
    }
    
}

module.exports = ValidationService;