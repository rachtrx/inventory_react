const logger = require("../logging");
class LoanDTO {
    
    constructor({
        id,
        loanEventId,
        reserveEventId, 
        filepath=null,
        ReserveEvent,
        LoanEvent,
        expectedReturnDate, 
        expectedLoanDate, 
        AstLoan,
        AccLoans,
        Usr,
    }) {
        this.loanId = id;

        this.loanEventId = loanEventId;
        this.reserveEventId = reserveEventId;
        this.expectedReturnDate = expectedReturnDate;
        this.expectedLoanDate = expectedLoanDate;

        const EventDTO = require("./event.dto");
        this.reserveEvent = ReserveEvent && new EventDTO(ReserveEvent);
        this.loanEvent = LoanEvent && new EventDTO(LoanEvent);
        
        if (AstLoan !== undefined) {
            const AstLoanDTO = require("./astLoan.dto");
            this.astLoan = AstLoan && new AstLoanDTO(AstLoan);
        }

        if (AccLoans) {
            const AccLoanDTO = require("./accLoan.dto");
            this.accLoans = AccLoans.map(accLoan => new AccLoanDTO(accLoan));
        }

        this.filepath = filepath;

        if (Usr) {
            const UserDTO = require("./usr.dto");
            this.user = new UserDTO(Usr);
        }
    }

    setReturnEvents() {
        const events = {};
    
        if (this.astLoan === undefined) throw new Error("Dev Error: Include AstLoan model in Loan");
        if (this.astLoan && this.astLoan.returnEvent === undefined) throw new Error("Dev Error: Include Event model in AstLoan");

        // return event can be null
        if (this.astLoan?.returnEvent) {
            events[this.astLoan.returnEvent.eventId] = {
                eventId: this.astLoan.returnEvent.eventId,
                by: this.astLoan.returnEvent.adminName,
                eventDate: this.astLoan.returnEvent.eventDate,
                remarks: this.astLoan.returnEvent.remarks,
                asset: {
                    assetId: this.astLoan.asset.assetId,
                    serialNumber: this.astLoan.asset.serialNumber
                },
                accessories: []
            };
        }

        if (this.accLoans === undefined) throw new Error("Dev Error: Include AccLoan model in Loan");
    
        if (this.accLoans?.length) {
            this.accLoans.forEach(accLoan => {
                if (accLoan.accReturns === undefined) {
                    throw new Error("Dev Error: Include AccReturns model in AccLoan");
                }
                if (accLoan.accType === undefined) {
                    throw new Error("Dev Error: Include AccType model in AccLoan");
                }
    
                accLoan.accReturns.forEach(accReturn => {
                    const eventId = accReturn.returnEvent.eventId;
                    const accessoryDetails = {
                        ...accReturn,
                        accessoryTypeId: accLoan.accType.accessoryTypeId,
                        accessoryName: accLoan.accType.accessoryName
                    };
    
                    if (!events[eventId]) {
                        events[eventId] = {
                            eventId: accReturn.returnEvent.eventId,
                            by: accReturn.returnEvent.adminName,
                            eventDate: accReturn.returnEvent.eventDate,
                            remarks: accReturn.returnEvent.remarks,
                            accessories: [accessoryDetails]
                        };
                    } else {
                        events[eventId].accessories.push(accessoryDetails);
                    }
                });
            });
        }

        this.returnEvents = Object.values(events)
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        return this;
    }    
}

module.exports = LoanDTO;