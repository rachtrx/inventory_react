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

        if (AccReturns) { // IMPT empty array is true
            this.accReturns = AccReturns.map(accReturn => new AccReturnDTO(accReturn));

            if (count && AccReturns.every(accReturn => Number.isFinite(accReturn.count))) {
                this.returned = AccReturns.reduce((total, accReturn) => total += accReturn.count, 0)
                this.unreturned = this.count - this.returned;
            }
        }
    }
}

module.exports = AccLoanDTO;