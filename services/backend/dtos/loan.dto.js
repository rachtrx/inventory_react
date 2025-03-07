const logger = require("../logging");

class LoanDTO {
    
    constructor({
        id,
        filepath=null,
        Event,
        AstLoan,
        AccLoans,
        Usr,
    }) {
        this.loanId = id;

        if (Event) {
            const EventDTO = require("./event.dto");
            this.event = new EventDTO(Event);
        }
        
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

        if (this.astLoan?.astReturns || this.accLoans?.some(accLoan => accLoan.accReturns?.length > 0)) {

            this.returnEvents = {}

            if (this.astLoan) {
                const astReturn = this.astLoan.astReturns.find(astReturn => !astReturn.event.cancelled && astReturn.event.closedDate);

                if (astReturn) {
                    const assetDetail = {
                        assetId: this.astLoan.asset.assetId,
                        serialNumber: this.astLoan.asset.serialNumber
                    };
    
                    if (!this.returnEvents[astReturn.event.eventId]) {
                        this.returnEvents[astReturn.event.eventId] = {
                            // openedBy: astReturn.event.openedAdminName,
                            // closedBy: astReturn.event.closedAdminName,
                            // openedDate: astReturn.event.openedDate,
                            // expectedCloseDate: astReturn.event.expectedCloseDate,
                            // closedDate: astReturn.event.closedDate,
                            // cancelled: astReturn.event.cancelled,
                            // remarks: astReturn.event.remarks,
                            ...astReturn.event,
                            asset: assetDetail,
                            accessories: []
                        }
                    } else {
                        this.returnEvents[astReturn.event.eventId].asset = assetDetail;
                    }
                }
            }

            if (this.accLoans?.length > 0) {
                this.accLoans.forEach(accLoan => {
                    const accReturns = accLoan.accReturns
                        .filter(accReturn => !accReturn.event.cancelled && accReturn.event.closedDate)
                    
                    accReturns?.forEach(accReturn => {
    
                        const accessoryDetail = {
                            ...accReturn,
                            accessoryTypeId: accLoan.accType.accessoryTypeId,
                            accessoryName: accLoan.accType.accessoryName
                        }
        
                        if (!this.returnEvents[accReturn.event.eventId]) {
                            this.returnEvents[accReturn.event.eventId] = {
                                ...accReturn.event,
                                accessories: [accessoryDetail]
                            }
                            logger.info(accLoan.accType.accessoryName);
                        } else {
                            this.returnEvents[accReturn.event.eventId].accessories.push(accessoryDetail);
                        }
                    })
                })
            }
        }
    }
}

module.exports = LoanDTO;