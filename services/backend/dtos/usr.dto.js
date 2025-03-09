const EventDTO = require("./event.dto");
const LoanDTO = require("./loan.dto");
const UserTagMapDTO = require("./usrTagMap.dto");
const { runInitialLoanCheck, assetIsOnLoan } = require("./utils");
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
        Loans,
        UsrTagMaps=null,
        isMatching=null,
        lastEventDate=null
    }) {

        if (lastEventDate !== null) {
            this.lastEventDate = lastEventDate
        }

        if (!isMatching === null) this.isMatching = isMatching;

        if (UsrTagMaps !== null) {
            this.tags = UsrTagMaps.map(usrTagMap => new UserTagMapDTO(usrTagMap));
        }

        // if (remarks !== null) this.remarks = remarks;

        this.userId = id;
        this.userName = userName;

        this.bookmarked = bookmarked === null ? null : bookmarked ? true : false;

        if (addEventId) this.addEventId = addEventId;
        if (addEventId || delEventId) this.delEventId = delEventId;
        
        if (AddEvent) this.addEvent = new EventDTO(AddEvent);
        if (DeleteEvent) this.deleteEvent = new EventDTO(DeleteEvent);
        
        if (Dept?.id) this.deptId = Dept.id;
        if (Dept?.deptName) this.deptName = Dept.deptName;

        this.loans = [];
        this.reservations = [];

        if (Loans) {
            Loans.forEach(loan => runInitialLoanCheck(loan));
            
            this.loans = Loans
                .filter(({ AstLoan, AccLoans, loanEventId }) => loanEventId && 
                    ((AstLoan && AstLoan.returnEventId === null) || 
                    (AccLoans?.length && (AccLoans.some(accLoan => accLoan.AccReturns.some(accReturn => accReturn.returnEventId === null))))
                ))
                .map(loan => new LoanDTO(loan));

            this.reservations = Loans
                .filter(({ reserveEventId, cancelEventId, loanEventId }) => reserveEventId && !cancelEventId && !loanEventId)
                .map(reservation => new LoanDTO(reservation));
        }
    }
}

module.exports = UserDTO;