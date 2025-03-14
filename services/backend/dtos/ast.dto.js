const AstLoanDTO = require("./astLoan.dto");
const AssetTagMapDTO = require("./astTagMap.dto");
const EventDTO = require("./event.dto");
const { runInitialAstLoanCheck } = require("./utils");

class AssetDTO {

    constructor({
        id, 
        serialNumber, 
        alias,
        bookmarked,
        value,
        remarks,
        Vendor,
        location,
        AstSType,
        AstLoans,
        addEventId,
        delEventId,
        AddEvent,
        DeleteEvent,
        AstTagMaps=null,
        lastEventDate=null
    }) {
        this.lastEventDate = lastEventDate

        if (AstTagMaps !== undefined) {
            this.tags = AstTagMaps && AstTagMaps.map(astTagMap => new AssetTagMapDTO(astTagMap.dataValues));
        }

        if (remarks) this.remarks = remarks;

        this.assetId = id;
        this.serialNumber = serialNumber;
        this.alias = alias;
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

        if (AstLoans) this.astLoans = AstLoans.map(astLoan => new AstLoanDTO(astLoan.dataValues));

        if (addEventId) this.addEventId = addEventId;
        if (delEventId !== undefined) this.delEventId = delEventId;
        
        if (AddEvent) this.addEvent = new EventDTO(AddEvent.dataValues);
        if (DeleteEvent) this.deleteEvent = new EventDTO(DeleteEvent.dataValues);
    }

    setOngoingLoan(includesLoan=true) {

        if (!this.checked) {
            if (!this.astLoans) throw new Error("Dev error: Include AstLoans in the query")
            if (this.astLoans.length === 0) return this;
            this.astLoans.forEach(astLoan => runInitialAstLoanCheck(astLoan, includesLoan));
            this.checked = true;
        }

        const ongoingAssetLoans = this.astLoans.filter(astLoan =>
            astLoan.returnEventId === null && astLoan.loan.loanEventId !== null
        ) || null;

        if (ongoingAssetLoans.length === 1) this.loan = ongoingAssetLoans[0].loan;
        else if (ongoingAssetLoans.length > 1) throw new Error(`Multiple ongoing loans found for ${this.serialNumber}`);

        return this;
    }

    setOngoingReservation(includesLoan=true) {

        if (!this.checked) {
            if (!this.astLoans) throw new Error("Dev error: Include AstLoans in the query")
            if (this.astLoans.length === 0) return this;
            this.astLoans.forEach(astLoan => runInitialAstLoanCheck(astLoan, includesLoan));
            this.checked = true;
        }

        const ongoingAssetReservations = this.astLoans.filter(astLoan => astLoan.loan.loanEventId === null)

        if (ongoingAssetReservations.length === 1) this.reservation = ongoingAssetReservations[0].loan;
        else if (ongoingAssetReservations.length > 1) throw new Error(`Multiple ongoing reservations found for ${this.serialNumber}`);

        return this;
    }
}
  
module.exports = AssetDTO;