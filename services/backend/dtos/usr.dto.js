const EventDTO = require("./event.dto");
const LoanDTO = require("./loan.dto");

class UserDTO {

    constructor({
        id,
        userName,
        bookmarked,
        eventId,
        Event,
        UsrDeletes,
        Dept,
        Loans,
        UsrTagMaps=null,
        isMatching=null,
    }) {

        if (!isMatching === null) this.isMatching = isMatching;

        if (UsrTagMaps !== null) {
            this.tags = UsrTagMaps
            .filter(usrTagMap => {
                const delEvent = usrTagMap.UsrTagMapDels.find(tagDel => !tagDel.Event.cancelled && tagDel.Event.closedDate)
                return !delEvent
            })
            .map(usrTagMap => ({
                tagId: usrTagMap.UsrTag?.id,
                tagName: usrTagMap.UsrTag?.tagName,
                userTagId: usrTagMap.id,
                isMatching: usrTagMap.get('isMatching'),
            }))
        }

        // if (remarks !== null) this.remarks = remarks;

        this.userId = id;
        this.userName = userName;

        this.bookmarked = bookmarked === null ? null : bookmarked ? true : false;

        if (eventId) this.addEventId = eventId;
        if (Event) this.addEvent = new EventDTO(Event)
            
        if (Dept?.id) this.deptId = Dept.id;
        if (Dept?.deptName) this.deptName = Dept.deptName;
        
        if (Loans) {
            this.scheduledLoans = []
            this.scheduledReturns = []
            this.loans = []

            this.loans = Loans.map(loan => new LoanDTO(loan));

            // for (const loan of loans) {

            //     if (!loan.Event.closedDate) this.scheduledLoans.push(loan);
            //     else {
            //         if (loan.astLoan.astReturns.some(astReturn => !astReturn.event.closedDate) ||
            //         loan.accLoans.some(accLoan => accLoan.accReturns.some(accReturn => !accReturn.event.closedDate)) )
            //         this.scheduledReturns.push(loan);
            //     }
            // }

            this.scheduledReturns = Loans
        }

        if (UsrDeletes?.length > 0) {
            this.usrDeletes = UsrDeletes.map(usrDelete => new EventDTO(usrDelete.Event));
            this.delEvent = UsrDeletes.find(usrDelete => usrDelete.cancelled === false && usrDelete.closedDate)?.Event;
            if (delEvent) this.delEventId = this.delEvent.id;
        }
    }
}

module.exports = UserDTO;