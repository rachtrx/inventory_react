const { Event, Loan, Rmk, AstLoan, AccLoan, AccType, Sequelize, Ast } = require("@models");
const { generateSecureID } = require("@utils/validation");
const path = require('path');
const fs = require('fs');
const logger = require("@/utils/logging");
const LoanValidation = require("./loanValidation");

class LoanService extends LoanValidation {

    constructor(users, authId, transaction) {
        super(users);
        this.transaction = transaction;
        this.authId = authId;
    }

    async processLoans() {
        this.validate();
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

            if (asset?.location){
                await Ast.update(
                    { location: asset.location },
                    {
                      where: { id: asset.assetId },
                      transaction: this.transaction
                    }
                );
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