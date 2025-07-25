const { AccType } = require("@/models");
const { AstLoan, Usr, Ast } = require("@models");
const { Op } = require('sequelize');

class LoanValidation {

    constructor(users) {
        this.users = users;
    }

    validate() {
        const assetIdToSNMap = new Map();
        const userIdToNameMap = new Map();
        const accTypeIdToNameMap = new Map();

        this.users.forEach(user => {
            if (userIdToNameMap.has(user.userId)) {
                throw new Error(`User ${user.userName} cannot appear twice`);
            }
            userIdToNameMap.set(user.userId, user.userName);

            user.loans.forEach(loan => {
                if (!loan.asset?.assetId && !loan.accessories?.some(acc => !!acc.accessoryTypeId)) {
                    throw new Error("Loan must include at least 1 asset or 1 accessory")
                }

                if (loan.asset?.assetId) {
                    if (assetIdToSNMap.has(loan.asset.assetId)) {
                        throw new Error(`Serial Number ${loan.asset.serialNumber} cannot appear twice`);
                    }
                    assetIdToSNMap.set(loan.asset.assetId, loan.asset.serialNumber);
                }

                if (loan.accessories?.length) {
                    loan.accessories.forEach(acc => {
                        if (accTypeIdToNameMap.has(acc.accessoryTypeId) && accTypeIdToNameMap.get(acc.accessoryTypeId) !== acc.accessoryName) {
                            throw new Error(`Accessory ID ${acc.accessoryTypeId} mismatch.`);
                        }
                        accTypeIdToNameMap.set(acc.accessoryTypeId, acc.accessoryName);
                    })
                }
            })
        });

        this.validateAssets(assetIdToSNMap);
        this.validateUsers(userIdToNameMap);
        this.validateAccs(accTypeIdToNameMap);
    }

    async validateAssets(assetIdToSNMap) {
        await Promise.all(
            [...assetIdToSNMap].map(async ([assetId, serialNumber]) => {
                const asset = await Ast.findByPk(assetId, {
                    transaction: this.transaction,
                    attributes: ['delEventId', 'serialNumber'],
                    include: [
                        {
                            model: AstLoan,
                            attributes: ['id', 'loanId'],
                            where: { returnEventId: null },
                            required: false, // device is returned if not found
                        }
                    ]
                });
                if (!asset) throw new Error(`No record found for Asset ID: ${assetId}`);
                if (asset.serialNumber !== serialNumber) throw new Error(`Asset ID ${assetId} mismatch`);
                if (asset.delEventId) {
                    throw new Error(`Asset ${assetData.serialNumber} is already condemned.`);
                }
                if (asset.AstLoans?.length > 0) {
                    throw new Error(`Asset with ID ${asset.serialNumber} is still on loan.`);
                }
            })
        );
    }

    async validateUsers(userIdToNameMap) {
        await Promise.all(
            [...userIdToNameMap].map(async ([userId, userName]) => {
                const user = await Usr.findByPk(userId, { transaction: this.transaction});
                if (!user) throw new Error(`No record found for User ID: ${userId}`);
                else if (user.userName !== userName) throw new Error(`User ID ${userId} mismatch.`);
                if (user.delEventId) {
                    throw new Error(`User ID ${userData.userId} is deleted.`);
                }
            })
        );
    }

    async validateAccs(accTypeIdToNameMap) {
        return await Promise.all(
            [...accTypeIdToNameMap].map(async ([accTypeId, accName]) => {
                const accType = await AccType.findByPk(accTypeId, { transaction: this.transaction });
                if (!accType) throw new Error(`No record found for Acc Type ID: ${accTypeId}`);
                else if (accType.accessoryName !== accName) throw new Error(`AccType ID ${accTypeId} mismatch.`);
            })
        );
    }    
}

module.exports = LoanValidation;