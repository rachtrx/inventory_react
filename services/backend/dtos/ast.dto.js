const AstLoanDTO = require("./astLoan.dto");
const EventDTO = require("./event.dto");

class AssetDTO {

    constructor({
        id, 
        serialNumber, 
        assetTag,
        bookmarked,
        shared,
        value,
        vendor,
        location,
        AstSType,
        AstLoans,
        addEventId,
        delEventId,
        AddEvent,
        DeleteEvent
    }) {
        this.assetId = id;
        this.serialNumber = serialNumber;
        this.assetTag = assetTag;
        this.bookmarked = bookmarked === null ? null : bookmarked ? true : false;

        if (AstSType) {

            if (AstSType.subTypeName) this.subTypeName = AstSType.subTypeName;
            if (AstSType.id) this.subTypeId = AstSType.id;

            if (AstSType.AstType) {
                if (AstSType.AstType.typeName) this.typeName = AstSType.AstType.typeName;
                if (AstSType.AstType.id) this.typeId = AstSType.AstType.id;
            }
        }

        this.shared = shared;
        this.value = value && String(parseFloat(this.value));
        this.vendor = vendor;
        this.location = location;

        if (AstLoans) {
            if (AstLoans.length === 0) this.ongoingLoan = null;
            else {
                this.astLoans = AstLoans.map(astLoan => new AstLoanDTO(astLoan));

                const ongoingLoans = this.astLoans.filter(astLoan =>
                    astLoan.returnEventId == null && astLoan.returnEvent?.eventId == null && // IMPT using == instead of === to handle both null and undefined
                    (astLoan.loan.loanEventId != null || astLoan.loan.loanEvent?.eventId != null)
                ) || null;

                if (ongoingLoans.length === 1) this.ongoingLoan = ongoingLoans[0];
                else if (ongoingLoans.length > 1) throw new Error(`Multiple ongoing loans found for ${this.serialNumber}`);
            }
        }

        if (addEventId) this.addEventId = addEventId;
        if (addEventId || delEventId) this.delEventId = delEventId;
        
        if (AddEvent) this.addEvent = new EventDTO(AddEvent);
        if (DeleteEvent) this.deleteEvent = new EventDTO(DeleteEvent);
    }
}
  
module.exports = AssetDTO;