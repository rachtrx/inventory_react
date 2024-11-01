const { formTypes } = require("../controllers/utils");
const { Event, Loan, Rmk, AstLoan, UsrLoan, AccLoan } = require("../models/postgres");
const { generateSecureID } = require("../utils/nanoidValidation");
const ValidationService = require("./ValidationService");
const path = require('path');
const fs = require('fs');

class LoanService extends ValidationService {

    constructor(loans, signatures, authId, transaction) {
        super(transaction, authId, formTypes.LOAN);
        this.loans = loans;
        this.signatures = signatures;
    }

    aggregateItems() {
        const assetIdToTagMap = new Map();
        const userIdToNameMap = new Map();

        this.loans.forEach(loan => {
            if (assetIdToTagMap.has(loan.asset.assetId) && assetIdToTagMap.get(loan.asset.assetId) !== loan.asset.assetTag) {
                throw new Error(`Ambiguous record for Asset ID ${loan.asset.assetId} with asset tags ${assetIdToTagMap.get(loan.asset.assetId)} and ${loan.asset.assetTag}`);
            }
            assetIdToTagMap.set(loan.asset.assetId, loan.asset.assetTag);
            
            loan.users.forEach(user => {
                if (userIdToNameMap.has(user.userId) && userIdToNameMap.get(user.userId) !== user.userName) {
                throw new Error(`Ambiguous record for User ID ${user.userId} with usernames ${userIdToNameMap.get(user.userId)} and ${user.userName}`);
                }
                userIdToNameMap.set(user.userId, user.userName);
            });
        });

        return { assetIdToTagMap, userIdToNameMap };
    }

    async validateAssets(assetIdToTagMap) {
        const assets = await Promise.all(
            [...assetIdToTagMap].map(async ([assetId, assetTag]) => {
                // Fetch the asset using findByPk
                return await this.getAsset(assetId, assetTag);
            })
        );
    }

    async validateUsers(userIdToNameMap) {
        const users = await Promise.all(
            [...userIdToNameMap].map(async ([userId, userName]) => await this.getUser(userId, userName))
        );

        users.forEach((userData) => {
            if (!typeof userData === 'object') {
                throw new MissingIdError(userData);
            }

            if (userData.delEventId) {
                throw new Error(`Usr with ID ${userData.userId} is deleted.`);
            }
        });
    }

    async handleNewAccessories() {
        const newAccessories = {}; // tracks <newAccTypeName>: <newAccTypeId>
        for (const loan of this.loans) {
            if (loan.asset.accessories) {
                for (const accessory of loan.asset.accessories) {
                    let accType;

                    // id === name means new. Check if added to newAccessories already
                    if (accessory.accessoryTypeId === accessory.accessoryName && !newAccessories[accessory.accessoryName]) {
                        accType = await accessoryController.createAccessoryType(
                            accessory.accessoryName,
                            0,
                            this.transaction
                        );
                        newAccessories[accessory.accessoryName] = accType.id;
                        accessory.accessoryTypeId = accType.id;
                    } else if (accessory.accessoryTypeId === accessory.accessoryName) {
                        // if new but added to newAccessories already, just need to update the id
                        accessory.accessoryTypeId = newAccessories[accessory.accessoryName];
                    }
                }
            }
        }
    }

    async createLoans() {
        const userLoans = {}

        const loanDate = new Loan();

        for (const loan of this.loans) {
            const { asset, users, mode, expectedReturnDate } = loan; // TODO use mode for future validation?

            const loanId = generateSecureID(); // PK for loan instance
            const loanEventId = generateSecureID(); // Attribute of loan instance

            // Event, Remarks
            await Event.create({
                id: loanEventId,
                eventDate: loanDate,
                adminId: this.authId,
            }, { transaction: this.transaction });

            await Loan.create({
                id: loanId,
                expectedReturnDate: expectedReturnDate || null,
                loanEventId: loanEventId
            }, { transaction: this.transaction })

            if (asset.remarks !== '') await Rmk.create({
                id: generateSecureID(),
                eventId: loanEventId,
                remarks: asset.remarks,
                remarkDate: loanDate,
            }, { transaction: this.transaction });

            // Create Ast Loan
            await AstLoan.create({
                id: generateSecureID(),
                loanId: loanId,
                assetId: asset.assetId,
            }, { transaction: this.transaction });
            
            // Usr Loans for each user
            for (const user of users) {
                const userLoan = await UsrLoan.create({
                    id: generateSecureID(),
                    loanId: loanId,
                    userId: user.userId,
                }, { transaction: this.transaction });
                
                // add loan to dictionary under user key to tag signature later
                if (!userLoans[user.userId]) userLoans[user.userId] = [userLoan]
                else userLoans[user.userId].push(userLoan);
            }

            // Acc Loans for each count of each type for each user
            if (asset.accessories) {
                for (const accessory of asset.accessories) {
                    for (let idx = 0; idx < accessory.count; idx++) {
                        await AccLoan.create({
                            id: generateSecureID(),
                            loanId: loanId,
                            accessoryTypeId: accessory.accessoryTypeId,
                        }, { transaction: this.transaction });
                    }
                }
            }
        }

        await this.saveSignatures(userLoans);
    }

    async saveSignatures(userLoans) {
        if (this.signatures) {
            for (const [userId, signature] of Object.entries(this.signatures)) {
                const base64Data = signature.replace(/^data:image\/png;base64,/, '');
                const fileName = `${Date.now()}-${userId}-signature.png`;
                const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
                const filePath = path.join(uploadsDir, 'signatures', fileName);

                await fs.promises.writeFile(filePath, base64Data, 'base64');

                for (const userLoan of userLoans[userId]) {
                    await userLoan.update({
                        filepath: filePath
                    }, { transaction: this.transaction });
                }
            }
        }
    }
}

module.exports = LoanService;