const logger = require("../logging");
const AccLoanDTO = require("./accLoan.dto");
const AstLoanDTO = require("./astLoan.dto");
const EventDTO = require("./event.dto");

class AccTypeDTO {

    constructor({
        id,
        accessoryName,
        stock,
        isMatching=null,
        remarks,
        AccTxns,
        AccLoans
    }) {
        if (isMatching !== null) this.isMatching = isMatching;

        if (remarks !== null) this.remarks = remarks;

        if (id) this.accessoryTypeId = id;
        
        if (accessoryName) this.accessoryName = accessoryName;
        if (Number.isFinite(stock)) this.stock = stock;

        if (AccTxns && AccTxns.every(accTxn => accTxn.count)) {
            this.registeredCount = AccTxns.reduce((accCount, accTxn) => {
                accCount += accTxn.count;
                return accCount;
            }, 0)
        } else if (AccTxns) { // TODO check if sequelize will give empty array
            this.registeredCount = 0;
        }

        if (AccLoans && AccLoans.length > 0) {
            this.accLoans = AccLoans.map(accLoan => new AccLoanDTO(accLoan));

            if (Number.isFinite(this.stock) && Number.isFinite(this.registeredCount) && 
                this.accLoans.every(accLoan => Number.isFinite(accLoan.count) && accLoan.loan)) {

                const loanCount = this.accLoans
                    .filter(accLoan => 
                        (accLoan.loan.loanEventId || accLoan.loan.loanEvent)
                    ).reduce((count, accLoan) => {
                        if (Number.isFinite(accLoan.unreturned)) count += accLoan.unreturned // returns made
                        else count += accLoan.count // no accReturns yet
                        return count;
                    }, 0)

                const reserveCount = this.accLoans
                    .filter(accLoan => 
                        (accLoan.loan.reserveEventId || accLoan.loan.reserveEvent) &&
                        !accLoan.loan.loanEventId && !accLoan.loan.loanEvent
                    ).reduce((count, accLoan) => {
                        count += accLoan.count // no accReturns yet
                        return count;
                    }, 0)

                logger.info(`${loanCount}, ${reserveCount}`)

                if (loanCount + reserveCount === this.registeredCount - this.stock) {
                    this.loanCount = loanCount;
                    this.reserveCount = reserveCount;
                }
            }
        } else if (AccLoans && Number.isFinite(this.stock) && Number.isFinite(this.registeredCount)) {
            if (this.registeredCount === this.stock) {
                this.loanCount = 0;
                this.reserveCount = 0;
            }
        }
    }
}
  
module.exports = AccTypeDTO;