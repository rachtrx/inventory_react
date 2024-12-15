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
        
        if (accessoryTypeId) this.accessoryTypeId = accessoryTypeId;

        if (!this.accessoryTypeId && AccType) {
            this.accessoryTypeId = AccType.id;
        }

        if (AccType) {
            this.accessoryName = AccType.accessoryName
        }

        if (count) this.count = count;

        if (AccReturns) {
            this.accReturns = AccReturns.map(accReturn => new AccReturnDTO(accReturn));
            if (count && AccReturns.every(accReturn => accReturn.count)) {
                this.returned = AccReturns.reduce((returnCount, accReturn) => {
                    return returnCount += accReturn.count;
                }, 0)
                this.unreturned = this.count - this.returned;
            }
        }   
    }
}

module.exports = AccLoanDTO;