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
        Vendor,
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
        if (Vendor) {
            if (Vendor.vendorName) this.vendorName = Vendor.vendorName;
            if (Vendor.id) this.vendorId = Vendor.id;
        }
        this.location = location;

        if (AstLoans) {
            this.ongoingLoan = null;
            
            this.astLoans = AstLoans.map(astLoan => new AstLoanDTO(astLoan));

            const ongoingAssetLoans = this.astLoans.filter(astLoan =>
                astLoan.returnEventId == null && astLoan.returnEvent?.eventId == null && // IMPT using == instead of === to handle both null and undefined
                (astLoan.loan.loanEventId != null || astLoan.loan.loanEvent?.eventId != null)
            ) || null;

            if (ongoingAssetLoans.length === 1) this.ongoingLoan = ongoingAssetLoans[0].loan;
            else if (ongoingAssetLoans.length > 1) throw new Error(`Multiple ongoing loans found for ${this.serialNumber}`);

            this.ongoingReservation = null;

            const ongoingAssetReservations = this.astLoans.filter(astLoan =>
                astLoan.loan.loanEventId == null && astLoan.loan.loanEvent?.eventId == null && // IMPT using == instead of === to handle both null and undefined
                astLoan.loan.cancelEventId == null && astLoan.loan.cancelEvent?.eventId == null) || null;

            if (ongoingAssetReservations.length === 1) this.ongoingReservation = ongoingAssetReservations[0].loan;
            else if (ongoingAssetReservations.length > 1) throw new Error(`Multiple ongoing reservations found for ${this.serialNumber}`);
        }

        if (addEventId) this.addEventId = addEventId;
        if (delEventId !== undefined) this.delEventId = delEventId;
        
        if (AddEvent) this.addEvent = new EventDTO(AddEvent);
        if (DeleteEvent) this.deleteEvent = new EventDTO(DeleteEvent);
    }
}
  
module.exports = AssetDTO;