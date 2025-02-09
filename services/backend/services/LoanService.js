const { Event, Loan, Rmk, AstLoan, AccLoan, AccType, Sequelize } = require("../models");
const { generateSecureID } = require("../utils/nanoidValidation");
const ValidationService = require("./ValidationService");
const path = require('path');
const fs = require('fs');
const accessoryController = require("../controllers/accessoryController");
const logger = require("../logging");

class LoanService extends ValidationService {

    constructor(users, authId, transaction) {
        super(transaction, authId);
        this.users = users;
    }

    aggregateItems() {
        const assetIdToSNMap = new Map();
        const userIdToNameMap = new Map();

        this.users.forEach(user => {
            if (userIdToNameMap.has(user.userId) && userIdToNameMap.get(user.userId) !== user.userName) {
                throw new Error(`Ambiguous record for User ID ${user.userId} with usernames ${userIdToNameMap.get(user.userId)} and ${user.userName}`);
            }
            userIdToNameMap.set(user.userId, user.userName);

            const assets = this.users.flatMap(user => user.loans.filter(loan => loan.asset?.assetId).map(loan => loan.asset))

            assets.forEach(asset => {
                if (assetIdToSNMap.has(asset.assetId) && assetIdToSNMap.get(asset.assetId)!== asset.serialNumber) {
                    throw new Error(`Ambiguous record for Asset ID ${asset.assetId} with asset tags ${assetIdToSNMap.get(asset.assetId)} and ${asset.serialNumber}`);
                }
                assetIdToSNMap.set(asset.assetId, asset.serialNumber);
            });
        });

        return { assetIdToSNMap, userIdToNameMap };
    }

    async validateAssets(assetIdToSNMap) {
        await Promise.all(
            [...assetIdToSNMap].map(async ([assetId, serialNumber]) => {
                // Fetch the asset using findByPk
                console.log(assetId, serialNumber);
                const asset = await this.getAsset(assetId, serialNumber);
                if (asset.AstLoans && asset.AstLoans.length > 0) {
                    throw new Error(`Asset with ID ${asset.assetTag} is still on loan!`);
                }
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
        for (const { loans } of this.users) {
            for (const loan of loans) {
                if (loan.accessories) {
                    for (const accessory of loan.accessories) {
                        let accType;
    
                        // id === name means new. Check if added to newAccessories already
                        if (!accessory.accessoryTypeId && accessory.accessoryName && !newAccessories[accessory.accessoryName]) {
                            accType = await accessoryController.createAccessoryType(
                                accessory.accessoryName,
                                0,
                                this.authId,
                                this.transaction
                            );
                            console.log(`New accessory ${accType.accessoryName} created`);
                            newAccessories[accessory.accessoryName] = accType.id;
                            accessory.accessoryTypeId = accType.id;
                        } else if (newAccessories[accessory.accessoryName]) {
                            // if new but added to newAccessories already, just need to update the id
                            accessory.accessoryTypeId = newAccessories[accessory.accessoryName];
                        }
                    }
                }
            }
        }
    }

    async createLoans() {
        const signatures = {}
        for (const user of this.users) {
            const loans = user.loans;
            const loanObjs = await this.createUserLoans(loans, user);

            if (!user.signature || user.signature === "") continue;

            console.log(user.signature);

            signatures[user.userId] = {
                signature: user.signature,
                loans: loanObjs
            }
        }

        // logger.info(signatures);
        await this.saveSignatures(signatures);
    }

    async createUserLoans(loans, user) {

        const loanDate = new Date();

        const newLoans = []

        for (const loan of loans) {
            const { asset, accessories, expectedReturnDate, remarks } = loan; // TODO use mode for future validation?

            const loanId = generateSecureID(); // PK for loan instance
            const loanEventId = generateSecureID(); // Attribute of loan instance
            
            const userId = user.userId;

            // Event, Remarks
            await Event.create({
                id: loanEventId,
                eventDate: loanDate,
                adminId: this.authId,
            }, { transaction: this.transaction });

            const newLoan = await Loan.create({
                id: loanId,
                expectedReturnDate: expectedReturnDate || null,
                loanEventId: loanEventId,
                userId: userId,
            }, { transaction: this.transaction })

            newLoans.push(newLoan); // IMPT DEFER SIGNATURE SAVE
            
            if (remarks !== '') await Rmk.create({
                id: generateSecureID(),
                eventId: loanEventId,
                remarks: remarks,
                remarkDate: loanDate,
            }, { transaction: this.transaction });

            if (!asset?.assetId && !accessories) throw new Error("Nothing detected to loan!")

            // Create Ast Loan
            if (asset?.assetId) {
                await AstLoan.create({
                    id: generateSecureID(),
                    loanId: loanId,
                    assetId: asset.assetId,
                }, { transaction: this.transaction });
            }

            // Acc Loans for each count of each type for each user
            if (accessories) {
                for (const accessory of accessories) {
                    await AccLoan.create({
                        id: generateSecureID(),
                        loanId: loanId,
                        accessoryTypeId: accessory.accessoryTypeId,
                        count: accessory.count
                    }, { transaction: this.transaction });

                    await AccType.update(
                        { 
                            stock: Sequelize.literal(`stock - ${accessory.count}`)
                        },
                        { 
                            where: { id: accessory.accessoryTypeId },
                            transaction: this.transaction
                        }
                    );
                }
            }
        }

        return newLoans;
    }

    async saveSignatures(signatures) {
        for (const [userId, {signature, loans}] of Object.entries(signatures)) {
            const base64Data = signature.replace(/^data:image\/png;base64,/, '');
            const fileName = `${Date.now()}-${userId}-signature.png`;
            const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
            const filePath = path.join(uploadsDir, 'signatures', fileName);

            await fs.promises.writeFile(filePath, base64Data, 'base64');

            for (const loan of loans) {
                await loan.update({
                    filepath: filePath
                }, { transaction: this.transaction });
            }
        }
    }
}

module.exports = LoanService;