const EventDTO = require("./event.dto");

class AstLoanDTO {

    constructor({
        id,
        Loan,
        loanId,
        Ast,
        returnEventId,
        ReturnEvent
    }) {
        this.assetLoanId = id;

        if (Loan) {
            const LoanDTO = require("./loan.dto");
            this.loan = new LoanDTO(Loan);
        }
        else if (loanId) this.loanId = loanId;

        if (Ast) {
            const AssetDTO = require("./ast.dto");
            this.asset = new AssetDTO(Ast);
        }
        if (returnEventId) this.returnEventId = returnEventId
        if (ReturnEvent) this.returnEvent = new EventDTO(ReturnEvent);
    }
}

module.exports = AstLoanDTO;