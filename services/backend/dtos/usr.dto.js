const EventDTO = require("./event.dto");
const UserLoanDTO = require("./usrLoan.dto");

class UserDTO {

    constructor({
        id,
        userName,
        bookmarked,
        addEventId, 
        delEventId,
        AddEvent,
        DeleteEvent,
        Dept,
        UsrLoans
    }) {
        this.userId = id;
        this.userName = userName;

        this.bookmarked = bookmarked === null ? null : bookmarked ? true : false;

        if (UsrLoans) this.usrLoans = UsrLoans.map(usrLoan => new UserLoanDTO(usrLoan));

        if (addEventId) this.addEventId = addEventId;
        if (addEventId || delEventId) this.delEventId = delEventId;
        
        if (AddEvent) this.addEvent = new EventDTO(AddEvent);
        if (DeleteEvent) this.deleteEvent = new EventDTO(DeleteEvent);
        
        if (Dept) this.department = Dept;

        if (UsrLoans) {
            this.userLoans = UsrLoans.map(userLoan => new UserLoanDTO(userLoan));
        }
    }
}

module.exports = UserDTO;