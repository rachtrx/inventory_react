const logger = require("../logging");
const AccReturnDTO = require("./accReturn.dto");

class AccLoanDTO {
    
    constructor({
        id,
        accessoryTypeId,
        Loan,
        loanId,
        count,
        AccReturns,
        AccType
    }) {

        this.accessoryLoanId = id;

        if (Loan) { // aggregation
            const LoanDTO = require("./loan.dto");
            this.loan = new LoanDTO(Loan);
        }

        if (loanId) this.loanId = loanId;

        if (AccType) {
            logger.info(AccType.get({ plain: true }))
            const AccTypeDTO = require("./accType.dto");
            this.accType = new AccTypeDTO(AccType.get({ plain: true }));
        }
        
        if (accessoryTypeId) this.accessoryTypeId = accessoryTypeId;

        if (count) this.count = count;

        if (AccReturns) {
            this.accReturns = AccReturns.map(accReturn => new AccReturnDTO(accReturn));
            if (count && AccReturns.every(accReturn => accReturn.count)) {
                this.returned = this.accReturns
                    .filter(accReturn => accReturn.event.closedDate && !accReturn.event.cancelled)
                    .reduce((returnCount, accReturn) => {
                    return returnCount += accReturn.count;
                }, 0)
                this.unreturned = this.count - this.returned;
            }
        }   
    }
}

module.exports = AccLoanDTO;