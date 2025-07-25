const logger = require('@/utils/logging.js');
const { generateSecureID } = require("@utils/validation.js");
const { Event, Rmk, Ast, AccLoan, AccReturn, Sequelize, AccType, Loan, AstLoan, Usr } = require("@models");
const { Op } = require("sequelize");
const { ReturnValidation } = require("./returnValidation.js");

class ReturnService {

    constructor(returns, authId, transaction) {
        this.transaction = transaction;
        this.authId = authId;
        this.returns = returns;
        this.returnDate = new Date();
    }

    async processReturns() {
        await Promise.all(
            this.returns.map(async _return => {
                const { astLoan, accLoans } = await this.validate(_return);
                
                const returnEventId = generateSecureID();
                await this.insertReturnEvent(returnEventId, _return.remarks);

                if (astLoan && _return.asset.count > 0) await this.returnAsset(returnEventId, astLoan, _return.asset.serialNumber);

                if (accLoans.length === 0) return;
                
                const accsToReturn = _return.accessoryTypes.filter(accessoryType => accessoryType.count > 0);
                for (const accToReturn of accsToReturn) {
                    const AccLoan = accLoans.find(accLoan => accLoan.accessoryTypeId === accToReturn.accessoryTypeId);
                    if (!AccLoan) {
                        throw new Error(`Accessory Loan not found for ${accToReturn.accessoryName}`);
                    }
                    await this.returnAccessory(returnEventId, AccLoan, accToReturn.count, accToReturn.accessoryName);
                }
            })
        );
    }

    async getLoan(loanId) {
        return await Loan.findByPk(loanId, {
            transaction: this.transaction,
            include: [
                {
                    model: AstLoan,
                    where: { returnEventId: { [Op.eq]: null } }, // find the loaned device
                    include: {
                        model: Ast,
                        required: true,
                        attributes: ['id', 'alias', 'serialNumber', 'delEventId'],
                    }
                },
                {
                    model: Usr,
                    attributes: ['userName', 'id'],
                },
                {
                    model: AccLoan,
                    include: {
                        model: AccReturn,
                        required: false,
                    },
                    required: false,
                }
            ]
        });
    }

    async validate(_return) {
        const { loanId, asset={}, accessoryTypes=[], userId } = _return;
        const loanRow = await this.getLoan(loanId);

        if (!loanRow || !loanRow.id) throw new Error(`No record found for Loan ID: ${loanId}`);

        const validation = new ReturnValidation(loanRow);
        validation.matchUserOnLoan(userId);
        if (asset?.assetId) validation.matchAssetOnLoan(asset.assetId);
        if (accessoryTypes?.length) validation.matchAccOnLoan(accessoryTypes);
        
        // ensure accessories match and have sufficient to return
        
        return {
            astLoan: loanRow.AstLoan || null, 
            accLoans: loanRow.AccLoans || []
        };
    }

    async insertReturnEvent(returnEventId, remarks) {
        await Event.create({
            id: returnEventId,
            eventDate: this.returnDate,
            adminId: this.authId,
        }, { transaction: this.transaction });

        if (remarks && remarks !== '') {
            await Rmk.create({
                id: generateSecureID(),
                eventId: returnEventId,
                remarkDate: this.returnDate,
                remarks: remarks,
                adminId: this.authId
            }, { transaction: this.transaction });
        }
    }

    async returnAsset(returnEventId, astLoan, serialNumber) {
        try {
            await AstLoan.update(
                { returnEventId },
                { 
                    where: { id: astLoan.id },
                    transaction: this.transaction
                }
            );
        } catch (error) {
            throw new Error(`Failed to return asset ${serialNumber}: ${error.message}`);
        }
    }

    async returnAccessory(returnEventId, accLoan, count, accName) {
        try {
            await AccReturn.create({
                id: generateSecureID(),
                count: count,
                accLoanId: accLoan.id,
                returnEventId
            }, { transaction: this.transaction });

            await AccType.update(
                { 
                    stock: Sequelize.literal(`stock + ${count}`)
                },
                { 
                    where: { id: accLoan.accessoryTypeId },
                    transaction: this.transaction
                }
            );
        } catch (error) {
            throw new Error(`Failed to return accessory ${accName}: ${error.message}`);
        }
    }
}

module.exports = ReturnService;