const logger = require("../logging");
const EventDTO = require("./event.dto");

class LoanDTO {
    
    constructor({
        id,
        reserveEventId, 
        cancelEventId, 
        loanEventId,
        ReserveEvent,
        CancelEvent,
        LoanEvent,
        expectedReturnDate, 
        expectedLoanDate, 
        AstLoan,
        AccLoans,
        UsrLoans
    }) {
        this.loanId = id;

        if (reserveEventId) this.reserveEventId = reserveEventId;
        if (cancelEventId) this.cancelEventId = cancelEventId;
        if (loanEventId) this.loanEventId = loanEventId;
        if (expectedReturnDate) this.expectedReturnDate = expectedReturnDate;
        if (expectedLoanDate) this.expectedLoanDate = expectedLoanDate;

        if (ReserveEvent) this.reserveEvent = new EventDTO(ReserveEvent);
        if (CancelEvent) this.cancelEvent = new EventDTO(CancelEvent);
        if (LoanEvent) this.loanEvent = new EventDTO(LoanEvent);
        
        if (AstLoan) {
            const AstLoanDTO = require("./astLoan.dto");
            this.astLoan = new AstLoanDTO(AstLoan);
        }

        if (AccLoans) {
            const AccLoanDTO = require("./accLoan.dto");
            this.accLoans = AccLoans.map(accLoan => new AccLoanDTO(accLoan));
        } else {
            this.accLoans = [];
        }

        if (UsrLoans) {
            const UserLoanDTO = require("./usrLoan.dto");
            this.userLoans = UsrLoans.map(usrLoan => new UserLoanDTO(usrLoan));
        }

        const loanedItems = [this.astLoan ?? [], ...(this.accLoans ?? [])];
        
        if (!loanedItems || loanedItems.length === 0) return;
        
        this.returnEvents = loanedItems.reduce((returns, loanItem) => {
            if (loanItem.returnEvent) { // AstLoan 
                if (!returns[loanItem.returnEvent.eventId]) {
                    returns[loanItem.returnEvent.eventId] = {
                        by: loanItem.returnEvent.returnBy,
                        eventDate: loanItem.returnEvent.eventDate,
                        remarks: loanItem.returnEvent.remarks,
                        isAsset: true,
                        accessories: []
                    }
                } else {
                    returns[loanItem.returnEvent.eventId].isAsset = true;
                }
            } else if (loanItem.accReturns && loanItem.accReturns.length > 0) {
                loanItem.accReturns.forEach(accReturn => {
                    if (!returns[accReturn.returnEvent.eventId]) {
                        returns[accReturn.returnEvent.eventId] = {
                            by: accReturn.returnEvent.returnBy,
                            eventDate: accReturn.returnEvent.eventDate,
                            remarks: accReturn.returnEvent.remarks,
                            isAsset: true,
                            accessories: [accReturn]
                        }
                    } else {
                        returns[accReturn.returnEvent.eventId].accessories.push(accReturn);
                    }
                })
            }

            return returns;
        }, {})
    }
}

module.exports = LoanDTO;