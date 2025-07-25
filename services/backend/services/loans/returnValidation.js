class ReturnValidation {

    constructor(loanRow) {
        this.loanRow = loanRow
    }

    matchAssetOnLoan(assetId) {
        const ref = this.loanRow.AstLoan?.Ast?.serialNumber ? `Serial Number ${this.loanRow.AstLoan.Ast.serialNumber}` : `Asset ID ${assetId}`;

        if (assetId && this.loanRow.AstLoan?.Ast?.delEventId) {
            throw new Error(`${ref} is condemned!`);
        }

        if (assetId && !this.loanRow.AstLoan?.Ast?.id) {
            throw new Error(`${ref} not found in system.`);
        }

        if(assetId && assetId !== this.loanRow.AstLoan?.Ast?.id) {
    throw new Error(`Asset ID mismatch for ${ref}.`);
        }
    }

    matchUserOnLoan(userId) {
        if (!(userId === this.loanRow.Usr.id)) throw new Error(`Unexpected mismatch of users for loan involving ${this.loanRow.Usr.userName}`);
    }

    matchAccOnLoan(accessoryTypes) {
        this.loanRow.AccLoans?.forEach(accLoan => {
            const foundAccType = accessoryTypes.find(accType => accLoan.accessoryTypeId === accType.accessoryTypeId);

            if (foundAccType) {
                const returnCount = accLoan.AccReturns.reduce((count, accReturn) => count + accReturn.count, 0)
                foundAccType.count = Number(foundAccType.count);
                if (foundAccType.count + returnCount > accLoan.count) throw new Error(`Returning more (${foundAccType.count}) ${foundAccType.accessoryName} than loaned (${accLoan.count}) for Loan ID ${this.loanRow.id}`);
            } else throw new Error(`Missing Return Count for Accessory ID ${accLoan.accessoryTypeId} for Loan ID ${this.loanRow.id}`);
        });
    }
}

module.exports = { ReturnValidation }