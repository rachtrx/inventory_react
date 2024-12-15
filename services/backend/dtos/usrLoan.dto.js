class UserLoanDTO {

    constructor({
        id,
        Loan,
        loanId,
        Usr,
        userId,
        filepath
    }) {
        if (id) this.userLoanId = id;

        if (Loan) {
            const LoanDTO = require("./loan.dto");
            this.loan = new LoanDTO(Loan);
        }

        if (loanId) this.loanId = loanId;

        if (userId) this.userId = userId;

        if (Usr) {
            const UserDTO = require("./usr.dto");
            this.user = new UserDTO(Usr);
        }
        if (filepath) this.filepath = filepath;
    }
}

module.exports = UserLoanDTO;