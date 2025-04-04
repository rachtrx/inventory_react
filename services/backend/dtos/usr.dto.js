const EventDTO = require("./event.dto");
const LoanDTO = require("./loan.dto");
const UserTagMapDTO = require("./usrTagMap.dto");
const { runInitialLoanCheck } = require("./utils");
class UserDTO {

    constructor({
        id,
        userName,
        email,
        bookmarked,
        addEventId, 
        delEventId,
        AddEvent,
        DeleteEvent,
        Dept,
        Loans,
        UsrTagMaps=null,
        lastEventDate=null
    }) {

        if (lastEventDate !== null) {
            this.lastEventDate = lastEventDate
        }

        if (UsrTagMaps !== null) {
            this.tags = UsrTagMaps.map(usrTagMap => new UserTagMapDTO(usrTagMap.dataValues));
        }

        // if (remarks !== null) this.remarks = remarks;

        this.userId = id;
        this.userName = userName;
        this.email = email;

        this.bookmarked = bookmarked === null ? null : bookmarked ? true : false;

        if (addEventId) this.addEventId = addEventId;
        if (addEventId || delEventId) this.delEventId = delEventId;
        
        if (AddEvent) this.addEvent = new EventDTO(AddEvent.dataValues);
        if (DeleteEvent) this.deleteEvent = new EventDTO(DeleteEvent.dataValues);
        
        if (Dept?.id) this.deptId = Dept.id;
        if (Dept?.deptName) this.deptName = Dept.deptName;

        // this.loans = [];
        // this.reservations = [];

        if (Loans) {
            this.userLoans = Loans.map(loan => new LoanDTO(loan.dataValues));
        }
    }

    setOngoingLoans() {

        if (!this.checked) {
            if (!this.userLoans) throw new Error("Dev error: Include Loans in the query")
            if (this.userLoans.length === 0) return this;
            this.userLoans.forEach(userLoan => runInitialLoanCheck(userLoan));
            this.checked = true;
        }

        this.loans = this.userLoans.filter(loan => {
            return loan.loanEventId !== null && ( // loan occured
                loan.astLoan?.returnEventId === null || // asset not returned
                loan.accLoans.find(accLoan => 
                    accLoan.accReturns.length === 0 || // no accessory returned at all
                    accLoan.count > accLoan.accReturns.reduce((total, accReturn) => total + accReturn.count) // partial return of accessory
                )
            )}
        ) || [];

        return this;
    }

    setOngoingReservations() {
        
        if(!this.checked) {
            if (!this.userLoans) throw new Error("Dev error: Include Loans in the query")
            if (this.userLoans.length === 0) return this;
            this.userLoans.forEach(userLoan => runInitialLoanCheck(userLoan));
            this.checked = true;
        }
        
        this.reservations = this.userLoans.filter(loan => loan.loanEventId === null) || [];

        return this;
    }
}

module.exports = UserDTO;