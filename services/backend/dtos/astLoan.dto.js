const AstReturnDTO = require("./astReturn");
const EventDTO = require("./event.dto");

class AstLoanDTO {

    constructor({
        id,
        Loan,
        loanId,
        Ast,
        AstReturns
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

        if (AstReturns) {
            this.astReturns = AstReturns.map(astReturn => new AstReturnDTO(astReturn));
        }
    }
}

module.exports = AstLoanDTO;