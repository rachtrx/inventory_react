const { formTypes } = require("../controllers/utils");
const ValidationService = require("./ValidationService");
const logger = require('../logging.js');
const { generateSecureID } = require("../utils/nanoidValidation.js");
const { getSingaporeDateTime } = require("../utils/utils.js");
const { Event, Rmk, Ast, AccLoan, AccReturn } = require("../models/index.js");
const AssetDTO = require("../dtos/ast.dto.js");

class ReturnService extends ValidationService{

    constructor(returns, authId, transaction) {
        super(transaction, authId, formTypes.RETURN);
        this.returns = returns;
        this.returnDate = new Date();
    }

    async processReturns() {
        await Promise.all(
            this.returns.map(async _return => {
                const validatedAssetRow = await this.validate(_return);
                await this.returnAsset(validatedAssetRow, _return);
            })
        );
    }

    async validate(_return) {
        const { assetId, assetTag, users, accessoryTypes } = _return;

        const validatedAssetRow = await this.getAsset(assetId, assetTag);

        const asset = new AssetDTO(validatedAssetRow);

        logger.info(asset);

        const allUsersMatch = asset.ongoingLoan.loan.userLoans.every(usrLoan => {
            return users.userIds.some(userId => userId === usrLoan.userId);
        });

        if (!allUsersMatch) throw new Error(`Unexpected mismatch of users for ${asset.assetTag}`);

        asset.ongoingLoan.accLoans?.every(accLoan => {

            const foundAccType = accessoryTypes.find(accType => accLoan.accessoryTypeId === accType.accessoryTypeId);

            if (foundAccType) {
                if (accLoan.unreturned < accType.count) throw new Error(`Returning more (${accType.count}) ${accType.accessoryName} than loaned (${accLoan.count}) for ${asset.assetTag}`);
            } else throw new Error(`Missing Return Count for Accessory ID ${accLoan.accessoryTypeId} for ${asset.assetTag}`);
        });

        return validatedAssetRow;
    }

    async returnAsset(assetRow, _return) {
        const { accessoryTypes, remarks } = _return;

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
                    remarkDate: this.returnDate,
                    remarks: remarks,
                    adminId: this.authId
                }, { transaction: this.transaction });
            }

            const ongoingAssetLoan = assetRow.AstLoans[0];

            ongoingAssetLoan.returnEventId = returnEventId;
            for (const accLoan of ongoingAssetLoan.Loan.AccLoans) {
                const returnCount = accessoryTypes.find(accType => accType.accessoryTypeId === accLoan.accessoryTypeId).count;
                
                await AccReturn.create({
                    id: generateSecureID(),
                    count: returnCount,
                    accLoanId: accLoan.id,
                    returnEventId: returnEventId
                }, { transaction: this.transaction });
            }

            console.log(assetRow instanceof Ast);  // Should be true
            ongoingAssetLoan.Loan.AccLoans.forEach(accLoan => {
                console.log(accLoan instanceof AccLoan);  // Should be true
            });

            await ongoingAssetLoan.save({ transaction: this.transaction });
            await Promise.all(ongoingAssetLoan.Loan.AccLoans.map(accLoan => accLoan.save({ transaction: this.transaction })));
        } catch (error) {
            throw new Error(`Failed to return asset ${assetRow.assetTag}: ${error.message}`);
        }
    }
}

module.exports = ReturnService;