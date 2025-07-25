const logger = require("@/utils/logging");
const AccLoanDTO = require("./accLoan.dto");
const AstLoanDTO = require("./astLoan.dto");
const EventDTO = require("./event.dto");

class AccTypeDTO {

    constructor({
        id,
        accessoryName,
        stock,
        isMatching=undefined,
        remarks,
        AccTxns,
        AccLoans
    }) {
        this.accessoryTypeId = id;
        this.accessoryName = accessoryName;

        if (isMatching !== undefined) this.isMatching = isMatching;
        if (remarks !== undefined) this.remarks = remarks;
        
        if (Number.isFinite(stock)) this.stock = stock;

        if (AccTxns && AccTxns.every(accTxn => accTxn.count)) {
            this.registeredCount = AccTxns.reduce((accCount, accTxn) => {
                accCount += accTxn.count;
                return accCount;
            }, 0)
        } else if (Array.isArray(AccTxns) && AccTxns.length === 0) {
            this.registeredCount = 0;
        }

        if (!Number.isFinite || !Number.isFinite(this.registeredCount) || !Array.isArray(AccLoans)) return;

        this.accLoans = AccLoans.map(accLoan => new AccLoanDTO(accLoan.dataValues));

        if (!this.accLoans.length) {
            if (this.registeredCount === this.stock) {
                this.loanCount = 0;
                this.reserveCount = 0;
            }
        } else if (this.accLoans.every(accLoan => Number.isFinite(accLoan.count) && accLoan.loan)) {

            const loanCount = this.accLoans
                .filter(accLoan => accLoan.loan.hasLoan()).reduce((count, accLoan) => {
                    if (Number.isFinite(accLoan.unreturned)) count += accLoan.unreturned // returns made
                    else count += accLoan.count // no accReturns yet
                    return count;
                }, 0)

            const reserveCount = this.accLoans
                .filter(accLoan => accLoan.loan.hasReservation()).reduce((count, accLoan) => {
                    count += accLoan.count // no accReturns yet
                    return count;
                }, 0)

            logger.info(`${loanCount}, ${reserveCount}`)

            if (loanCount + reserveCount === this.registeredCount - this.stock) {
                this.loanCount = loanCount;
                this.reserveCount = reserveCount;
            }
        }
    }
}
  
module.exports = AccTypeDTO;