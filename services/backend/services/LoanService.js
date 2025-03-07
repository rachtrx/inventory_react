const { Event, Loan, Rmk, AstLoan, AccLoan, AccType, Sequelize } = require("../models");
const { generateSecureID } = require("../utils/nanoidValidation");
const ValidationService = require("./ValidationService");
const path = require('path');
const fs = require('fs');
const accessoryController = require("../controllers/accessories/accessoryController");
const logger = require("../logging");
const addAccessoryController = require("../controllers/accessories/addAccessoryController");

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
                    if (assetIdToSNMap.has(asset.assetId) && assetIdToSNMap.get(asset.assetId)!== asset.serialNumber) {
                        throw new Error(`Ambiguous record for Asset ID ${asset.assetId} with serial number and ${asset.serialNumber}`);
                    }
                    assetIdToSNMap.set(asset.assetId, asset.serialNumber);
                }
            })
        });

        return { assetIdToSNMap, userIdToNameMap };
    }

    async validateAssets(assetIdToSNMap) {
        await Promise.all(
            [...assetIdToSNMap].map(async ([assetId, serialNumber]) => {
                // Fetch the asset using findByPk
                // console.log(assetId, serialNumber);
                const asset = await this.getAssetOnLoan(assetId, serialNumber);
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

    async createScheduledLoans() {
        for (const user of this.users) {
            const loans = user.loans;
            await this.createUserLoans(loans, user, false);
        }
    }

    async createUserLoans(loans, user, expectedDate) {

        const loanDate = new Date();

        const newLoans = []

        for (const loan of loans) {
            const { asset, accessories, expectedReturnDate, remarks } = loan; // TODO use mode for future validation?

            const loanId = generateSecureID(); // PK for loan instance
            const loanEventId = generateSecureID(); // Attribute of loan instance
            
            const userId = user.userId;

            const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });

            // Event, Remarks
            await Event.create({
                id: loanEventId,
                openedDate: curDate,
                openedAdminId: this.authId,
                ...(expectedDate && { expectedCloseDate: expectedDate }),
                ...(!expectedDate && {
                    closedDate: curDate,
                    closedAdminId: this.authId,
                }),
            }, { transaction: this.transaction });

            const newLoan = await Loan.create({
                id: loanId,
                expectedReturnDate: expectedReturnDate || null,
                eventId: loanEventId,
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
            const uploadsDir = process.env.SIGNATURES_DIR || path.join(__dirname, '../uploads');
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