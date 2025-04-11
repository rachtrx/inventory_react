const ValidationService = require("./ValidationService");
const logger = require('../logging.js');
const { generateSecureID } = require("../utils/nanoidValidation.js");
const { getSingaporeDateTime } = require("../utils/utils.js");
const { Event, Rmk, Ast, AccLoan, AccReturn, Sequelize, AccType, Loan, AstLoan, Usr } = require("../models/index.js");
const AssetDTO = require("../dtos/ast.dto.js");
const { Op } = require("sequelize");

class ReturnService extends ValidationService{

    constructor(returns, authId, transaction) {
        super(transaction, authId);
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

                console.log(_return.accessoryTypes[0].count);
                console.log(typeof _return.accessoryTypes[0].count);
                
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

    async getLoan(loanId, assetId) {
        const loan = await Loan.findByPk(loanId, {
            transaction: this.transaction,
            include: [
                {
                    model: AstLoan,
                    where: { returnEventId: { [Op.eq]: null } }, // find the loaned device
                    required: assetId ? true : false, // device is returned if not found
                    include: {
                        model: Ast,
                        required: true,
                        attributes: ['id', 'alias', 'serialNumber'],
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
                    required: assetId ? false : true,
                }
            ]
        });

        if (!loan || !loan.id) throw new Error(`No record found for Loan ID: ${loanId}`);

        if (assetId && loan.AstLoan?.Ast?.delEventId) {
            throw new Error(`Asset ${loan.AstLoan.Ast.serialNumber} is condemned!`);
        }

        if (assetId && !loan.AstLoan?.Ast?.id) {
            throw new Error(`Asset is not on loan for loan ID ${loan.id}!`);
        }

        if(assetId && assetId !== loan.AstLoan?.Ast?.id) {
            throw new Error(`Mismatch for Asset ID: ${_return.asset?.assetId}. 
                Expected serialNumber: ${_return.asset.serialNumber}, but found: ${loan.AstLoan.Ast.serialNumber}`);
        }

        return loan;
    }

    async validate(_return) {
        const { loanId, asset={}, accessoryTypes=[], userId } = _return;

        const returningAst = asset.count && asset.count > 0;
        const loanRow = await this.getLoan(loanId, returningAst ? asset.assetId : null);

        if (!(userId === loanRow.Usr.id)) throw new Error(`Unexpected mismatch of users for Loan ID ${_return.loanId}: 
            ${_return.userName} and ${loanRow.Usr.userName}`);
        
        // ensure accessories match and have sufficient to return
        loanRow.AccLoans?.forEach(accLoan => {
            const foundAccType = accessoryTypes.find(accType => accLoan.accessoryTypeId === accType.accessoryTypeId);

            if (foundAccType) {
                const returnCount = accLoan.AccReturns.reduce((count, accReturn) => count + accReturn.count, 0)
                foundAccType.count = Number(foundAccType.count);
                if (foundAccType.count + returnCount > accLoan.count) throw new Error(`Returning more (${foundAccType.count}) ${foundAccType.accessoryName} than loaned (${accLoan.count}) for Loan ID ${loanRow.id}`);
            } else throw new Error(`Missing Return Count for Accessory ID ${accLoan.accessoryTypeId} for Loan ID ${loanRow.id}`);
        });

        return {
            astLoan: loanRow.AstLoan || null, 
            accLoans: loanRow.AccLoans || []
        }; // IMPT return the ORM Object!
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