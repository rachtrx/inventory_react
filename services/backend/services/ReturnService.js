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
                const valLoanRow = await this.validate(_return);
                await this.returnAsset(valLoanRow, _return);
            })
        );
    }

    async getLoan(loanId, hasAst=true) {
        const loan = await Loan.findByPk(loanId, {
            transaction: this.transaction,
            attributes: ['id', 'loanEventId', 'userId'],
            include: [
                {
                    model: AstLoan,
                    attributes: ['id', 'loanId'],
                    where: { returnEventId: { [Op.eq]: null } }, // find the loaned device
                    required: hasAst ? true : false, // device is returned if not found
                    include: {
                        model: Ast,
                        required: true,
                        attributes: ['id', 'assetTag', 'serialNumber'],
                    }
                },
                {
                    model: Usr,
                    attributes: ['userName', 'id'],
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
                    required: !hasAst ? false : true,
                }
            ]
        });
        if (!loan || !loan.id) throw new Error(`No record found for Loan ID: ${loanId}`);

        if (loan.AstLoan.Ast.delEventId) {
            throw new Error(`Asset AstTag ${assetData.assetTag} is condemned!`);
        }

        return loan;
    }

    async validate(_return) {
        const { asset, accessoryTypes, remarks } = _return;

        const loanRow = await this.getLoan(_return.loanId, _return.asset?.assetId);

        if(_return.asset?.assetId) {

            if (!loanRow.AstLoan || !loanRow.AstLoan.id) {
                throw new Error(`Asset with ID ${_return.asset.serialNumber} is not on loan!`);
            }

            if (loanRow.AstLoan.Ast.id !== _return.asset?.assetId) {
                throw new Error(`Mismatch for Asset ID: ${_return.asset?.assetId}. 
                    Expected serialNumber: ${_return.asset.serialNumber}, but found: ${loanRow.AstLoan.Ast.serialNumber}`);
            }

            if (_return.asset.count !== 0) {
                loanRow.AstLoan
            }
        }

        const userMatch = _return.userId = loanRow.Usr.id;

        if (!userMatch) throw new Error(`Unexpected mismatch of users for Loan ID ${_return.loanId}: 
            ${_return.userName} and ${loanRow.Usr.userName}`);

            loanRow.accLoans?.every(accLoan => {

                const foundAccType = accessoryTypes.find(accType => accLoan.accessoryTypeId === accType.accessoryTypeId);

                if (foundAccType) {
                    if (accLoan.unreturned < foundAccType.count) throw new Error(`Returning more (${foundAccType.count}) ${foundAccType.accessoryName} than loaned (${accLoan.count}) for ${assetObj.assetTag}`);
                } else throw new Error(`Missing Return Count for Accessory ID ${accLoan.accessoryTypeId} for ${asset.assetTag}`);
            });

        return loanRow; // IMPT return the ORM Object!
    }

    async returnAsset(loanRow, _return) {
        const { asset, accessoryTypes, remarks } = _return;

        const returnEventId = generateSecureID(); // Attribute of loan instance
    
        try {
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

            if (asset && asset.count > 0) {
                await AstLoan.update(
                    { returnEventId },
                    { 
                        where: { id: loanRow.AstLoan.id },
                        transaction: this.transaction
                    }
                );
            }

            if (accessoryTypes && accessoryTypes.length > 0) {
                for (const accLoan of loanRow.AccLoans) {
                    const returnCount = accessoryTypes.find(accType => accType.accessoryTypeId === accLoan.accessoryTypeId).count;

                    await AccReturn.create({
                        id: generateSecureID(),
                        count: returnCount,
                        accLoanId: accLoan.id,
                        returnEventId: returnEventId
                    }, { transaction: this.transaction });

                    await AccType.update(
                        { 
                            stock: Sequelize.literal(`stock + ${returnCount}`)
                        },
                        { 
                            where: { id: accLoan.accessoryTypeId },
                            transaction: this.transaction
                        }
                    );
                }
            }
        } catch (error) {
            throw new Error(`Failed to return asset ${assetRow.assetTag}: ${error.message}`);
        }
    }
}

module.exports = ReturnService;