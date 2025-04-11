const { Event, Loan, Rmk, AstLoan, AccLoan, AccType, Sequelize, Ast } = require("../models");
const { generateSecureID } = require("../utils/nanoidValidation");
const ValidationService = require("./ValidationService");
const path = require('path');
const fs = require('fs');
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

            user.loans.forEach(loan => {
                if (!loan.asset?.assetId && loan.accessories?.length === 0) {
                    throw new Error("Loan must include at least 1 asset or 1 accessory")
                }

                if (loan.asset?.assetId) {
                    if (assetIdToSNMap.has(loan.asset.assetId) && assetIdToSNMap.get(loan.asset.assetId)!== loan.asset.serialNumber) {
                        throw new Error(`Ambiguous record for Asset ID ${loan.asset.assetId} with serial number and ${loan.asset.serialNumber}`);
                    }
                    assetIdToSNMap.set(loan.asset.assetId, loan.asset.serialNumber);
                }
            })
        });

        return { assetIdToSNMap, userIdToNameMap };
    }

    async getAssetOnLoan(assetId, serialNumber) {
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
        if (asset.serialNumber !== serialNumber) throw new Error(`Mismatch for Asset ID: ${assetId}. Expected serialNumber: ${serialNumber}, but found: ${asset.serialNumber}`);

        if (asset.delEventId) {
            throw new Error(`Asset ${assetData.serialNumber} is already condemned!`);
        }
        return asset;
    }

    async validateAssets(assetIdToSNMap) {
        await Promise.all(
            [...assetIdToSNMap].map(async ([assetId, serialNumber]) => {
                // Fetch the asset using findByPk
                // console.log(assetId, serialNumber);
                const asset = await this.getAssetOnLoan(assetId, serialNumber);
                if (asset.AstLoans?.length > 0) {
                    throw new Error(`Asset with ID ${asset.serialNumber} is still on loan!`);
                }
            })
        );
    }

    async validateUsers(userIdToNameMap) {
        const users = await Promise.all(
            [...userIdToNameMap].map(async ([userId, userName]) => await this.getUser(userId, userName))
        );

        users.forEach((userData) => {
            if (userData.delEventId) {
                throw new Error(`Usr with ID ${userData.userId} is deleted.`);
            }
        });
    }

    async createLoans() {
        const signatures = {}
        for (const user of this.users) {
            const loans = user.loans;
            const loanObjs = await this.createUserLoans(loans, user);

            if (!user.signature || user.signature === "") continue;

            // console.log(user.signature);

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
            const filePath = path.join(process.env.SIGNATURES_DIR, fileName);

            fs.promises.mkdir(path.dirname(filePath), { recursive: true });

            await fs.promises.writeFile(filePath, base64Data, 'base64');

            for (const loan of loans) {
                await loan.update({
                    filepath: fileName
                }, { transaction: this.transaction });
            }
        }
    }
}

module.exports = LoanService;