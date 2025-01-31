const EventDTO = require("./event.dto");
const UserLoanDTO = require("./usrLoan.dto");

class UserDTO {

    constructor({
        id,
        userName,
        bookmarked,
        addEventId, 
        delEventId,
        isMatching = null,
        AddEvent,
        DeleteEvent,
        Dept,
        UsrLoans
    }) {

        this.isMatching = isMatching;

        this.userId = id;
        this.userName = userName;

        this.bookmarked = bookmarked === null ? null : bookmarked ? true : false;

        if (UsrLoans) {
            const loansWithItems = UsrLoans.filter(usrLoan => usrLoan.Loan && (usrLoan.Loan.AstLoan || usrLoan.Loan.AccLoans));
            if (loansWithItems.length > 0) this.usrLoans = UsrLoans.map(usrLoan => new UserLoanDTO(usrLoan));
        }

        if (addEventId) this.addEventId = addEventId;
        if (addEventId || delEventId) this.delEventId = delEventId;
        
        if (AddEvent) this.addEvent = new EventDTO(AddEvent);
        if (DeleteEvent) this.deleteEvent = new EventDTO(DeleteEvent);
        
        if (Dept?.id) this.deptId = Dept.id;
        if (Dept?.deptName) this.deptName = Dept.deptName;

        if (UsrLoans) {
            this.userLoans = UsrLoans.map(userLoan => new UserLoanDTO(userLoan));
        }
    }
}

module.exports = UserDTO;