const { formTypes } = require("../controllers/utils");
const ValidationService = require("./ValidationService");
const logger = require('../logging.js');
const { generateSecureID } = require("../utils/nanoidValidation.js");
const { getSingaporeDateTime } = require("../utils/utils.js");
const { Event, Rmk, Ast, AccLoan } = require("../models/postgres/index.js");

class ReturnService extends ValidationService{

    constructor(returns, authId, transaction) {
        super(transaction, authId, formTypes.RETURN);
        this.returns = returns;
        this.returnDate = new Date();
    }

    async processReturns() {
        await Promise.all(
            this.returns.map(async _return => {
                const asset = await this.validate(_return);
                await this.returnAsset(asset);
            })
        );
    }

    async validate(_return) {
        const { assetId, assetTag, users, accessories } = _return;

        const trueAsset = await this.getAsset(assetId, assetTag);

        if(!trueAsset.AstLoans) throw new Error(`No loans found for ${assetTag}`);
        else if (trueAsset.AstLoans.length > 1) throw new Error(`Multiple loans found for ${assetTag}, please fix corrupted data.`);

        const loan = trueAsset.AstLoans[0].Loan;

        const allUsersMatch = loan.UsrLoans.every(usrLoan => {
            return users.userIds.some(userId => userId === usrLoan.userId);
        });

        if (!allUsersMatch) throw new Error(`Unexpected mismatch of users for ${trueAsset.assetTag}`);

        // Ensure matching accessories and sufficient to return
        const accMap = accessories.reduce((acc, accType) => {
            acc[accType.accessoryTypeId] = accType.count;
            return acc;
        }, {});

        loan.AccLoans?.every(accLoan => {
            const foundAccType = accessories.find(accType => 
                accType.accessoryLoanIds.some(accLoanId => accLoanId === accLoan.id)
            );
            if (foundAccType) {
                accLoan.isReturning = accMap[foundAccType.accessoryTypeId] > 0 ? true : false;
                accMap[foundAccType.accessoryTypeId]--;
                return true;
            }
            throw new Error(`Unexpected mismatch of accessories for ${trueAsset.assetTag}`);
        });
        
        if(Object.values(accMap).some(count => count > 0)) throw new Error(`Insufficient accessories to return for ${trueAsset.assetTag}`);

        return trueAsset;
    }

    async returnAsset(asset, remarks = '') {
        const returnEventId = generateSecureID(); // Attribute of loan instance
    
        try {
            await Event.create({
                id: returnEventId,
                eventDate: this.returnDate,
                adminId: this.authId,
            }, { transaction: this.transaction });
    
            if (remarks !== '') {
                await Rmk.create({
                    id: generateSecureID(),
                    eventId: returnEventId,
                    remarks: remarks,
                }, { transaction: this.transaction });
            }
    
            // Update the asset and accLoans with returnEventId
            asset.AstLoans[0].returnEventId = returnEventId;
            asset.AstLoans[0].Loan.AccLoans.forEach(accLoan => {
                if (accLoan.isReturning) accLoan.returnEventId = returnEventId;
            });

            console.log(asset instanceof Ast);  // Should be true
            asset.AstLoans[0].Loan.AccLoans.forEach(accLoan => {
                console.log(accLoan instanceof AccLoan);  // Should be true
            });

            await asset.AstLoans[0].save({ transaction: this.transaction });
            await Promise.all(asset.AstLoans[0].Loan.AccLoans.map(accLoan => accLoan.save({ transaction: this.transaction })));
        } catch (error) {
            throw new Error(`Failed to return asset ${asset.assetTag}: ${error.message}`);
        }
    }
}

module.exports = ReturnService;