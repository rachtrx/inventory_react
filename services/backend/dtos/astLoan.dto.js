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
            this.loan = new LoanDTO(Loan.dataValues);
        }
        else if (loanId) this.loanId = loanId;

        if (Ast) {
            const AssetDTO = require("./ast.dto");
            this.asset = new AssetDTO(Ast.dataValues);
        }
        if (returnEventId !== undefined) this.returnEventId = returnEventId
        if (ReturnEvent !== undefined) this.returnEvent = ReturnEvent && new EventDTO(ReturnEvent.dataValues);
    }
}

module.exports = AstLoanDTO;