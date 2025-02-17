const logger = require("../logging");
const EventDTO = require("./event.dto");

class LoanDTO {
    
    constructor({
        id,
        loanEventId,
        reserveEventId, 
        cancelEventId, 
        filepath=null,
        ReserveEvent,
        CancelEvent,
        LoanEvent,
        expectedReturnDate, 
        expectedLoanDate, 
        AstLoan,
        AccLoans,
        Usr,
    },
    includeReturnDetails = false
    ) {
        this.loanId = id;

        if (loanEventId) this.loanEventId = loanEventId;
        if (reserveEventId) this.reserveEventId = reserveEventId;
        if (cancelEventId) this.cancelEventId = cancelEventId;
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
        }

        if (filepath !== null) {
            this.filepath = filepath;
        }

        if (Usr) {
            const UserDTO = require("./usr.dto");
            this.user = new UserDTO(Usr);
        }

        if (includeReturnDetails) this.generateReturnEvents()
    }

    generateReturnEvents() {
        const loanedItems = [this.astLoan ?? [], ...(this.accLoans ?? [])];
        if (!loanedItems || loanedItems.length === 0) return;

        this.returnEvents = loanedItems.reduce((returns, loanItem) => {
            if (loanItem.returnEvent) { // AstLoan 
                if (!returns[loanItem.returnEvent.eventId]) {
                    logger.info(loanItem)
                    returns[loanItem.returnEvent.eventId] = {
                        by: loanItem.returnEvent.adminName,
                        eventDate: loanItem.returnEvent.eventDate,
                        remarks: loanItem.returnEvent.remarks,
                        asset: {
                            assetId: loanItem.asset.assetId,
                            serialNumber: loanItem.asset.serialNumber
                        },
                        accessories: []
                    }
                } else {
                    returns[loanItem.returnEvent.eventId].isAsset = true;
                }
            } 
            
            if (loanItem.accReturns && loanItem.accReturns.length > 0) {
                loanItem.accReturns.forEach(accReturn => {

                    const accessoryDetails = {
                        ...accReturn,
                        accessoryTypeId: loanItem.accType.accessoryTypeId,
                        accessoryName: loanItem.accType.accessoryName
                    }

                    if (!returns[accReturn.returnEvent.eventId]) {
                        returns[accReturn.returnEvent.eventId] = {
                            by: accReturn.returnEvent.returnBy,
                            eventDate: accReturn.returnEvent.eventDate,
                            remarks: accReturn.returnEvent.remarks,
                            accessories: [accessoryDetails]
                        }
                        logger.info(loanItem.accessoryName)
                    } else {
                        returns[accReturn.returnEvent.eventId].accessories.push(accessoryDetails);
                    }
                })
            }

            return returns;
        }, {})
    }
}

module.exports = LoanDTO;