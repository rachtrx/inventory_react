const AstLoanDTO = require("./astLoan.dto");
const EventDTO = require("./event.dto");

class AssetDTO {

    /**
     * Has the following optional attributes: tags, remarks, assetId, serialNumber, assetTag, bookmarked, subTypeName, subTypeId, typeName, typeId, value, vendorName, vendorId, astLoans, addEvent, ongoingLoanId, ongoingReservationId, addEventId, delEventId
     * 
     * **/

    constructor({
        id, 
        serialNumber, 
        assetTag,
        bookmarked,
        value,
        remarks,
        Vendor,
        location,
        AstSType,
        AstLoans,
        eventId,
        Event,
        AstDeletes,
        AstTagMaps=null,
        lastEventDate=null
    }) {
        if (lastEventDate !== null) {
            this.lastEventDate = lastEventDate
            // toISOString();
        }

        if (AstTagMaps !== null) {
            this.tags = AstTagMaps
                .filter(astTagMap => {
                    const delEvent = astTagMap.AstTagMapDels.find(tagDel => !tagDel.Event.cancelled && tagDel.Event.closedDate)
                    return !delEvent
                })
                .map(astTagMap => ({
                    tagId: astTagMap.AstTag?.id,
                    tagName: astTagMap.AstTag?.tagName,
                    assetTagId: astTagMap.id,
                    isMatching: astTagMap.get('isMatching'),
                }))
        }

        if (remarks) this.remarks = remarks;

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

        this.value = value && String(parseFloat(this.value));
        if (Vendor) {
            if (Vendor.vendorName) this.vendorName = Vendor.vendorName;
            if (Vendor.id) this.vendorId = Vendor.id;
        }
        this.location = location;

        if (AstLoans) {
            this.astLoans = AstLoans.map(astLoan => new AstLoanDTO(astLoan));

            const ongoingAssetLoans = this.astLoans.filter(
                astLoan => !astLoan.astReturns?.some(astReturn => !astReturn.event.cancelled && astReturn.event.closedDate)) || null;
            
            if (ongoingAssetLoans.length === 1) {
                this.ongoingLoanId = ongoingAssetLoans[0].loan.loanId;
            }
            else if (ongoingAssetLoans.length > 1) throw new Error(`Multiple ongoing loans found for ${this.serialNumber}`);

            const ongoingAssetReservations = this.astLoans.filter(astLoan =>
                // Filter for scheduled loans
                !astLoan.loan.event.closedDate
            ) || null;

            if (ongoingAssetReservations.length === 1) {
                this.ongoingReservationId = ongoingAssetReservations[0].loan.loanId;
            }
            else if (ongoingAssetReservations.length > 1) throw new Error(`Multiple ongoing reservations found for ${this.serialNumber}`);
        }

        if (eventId) this.addEventId = eventId;
        if (Event) {
            this.addEvent = new EventDTO(Event);
            this.addEventId = Event.id;
        }
        
        if (AstDeletes && AstDeletes.length > 0) {
            this.astDeletes = AstDeletes.map(astDelete => new EventDTO(astDelete.Event));
            this.delEvent = AstDeletes.find(astDelete => astDelete.cancelled === false && astDelete.closedDate)?.event;
            // console.log(this.delEvent);
            if (this.delEvent) {
                this.delEventId = this.delEvent.id;
            }
        }
    }
}
  
module.exports = AssetDTO;