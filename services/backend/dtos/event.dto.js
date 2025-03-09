const LoanDTO = require("./loan.dto");
const RemarkDTO = require("./remark.dto");

class EventDTO {

    constructor({
        id,
        adminId,
        eventDate,
        Admin,
        Rmks,
        Loan, // ignore returns; paired with loan
        Reservation, // TODO cancellation?
        AccType,
        AccTxn,
        AddedAsset,
        DeletedAsset,
        AddedUser,
        DeletedUser,
        AddedAssetTag,
        DeletedAssetTag,
        AddedUsrTag,
        DeletedUsrTag
    }) {
        if (eventDate) {
            this.eventDate = new Date(eventDate).toLocaleString("en-SG", {
                timeZone: "Asia/Singapore",
            });
        }
        if (id) this.eventId = id;
        if (adminId) this.adminId = adminId;

        if (Admin) this.adminName = Admin.adminName;
        if (Rmks) this.remarks = Rmks.map(remark => new RemarkDTO(remark));

        if (Loan) {this.loan = new LoanDTO(Loan).setReturnEvents()} // contains return details AssetReturn and AccReturns
        if (Reservation) this.reservation = new LoanDTO(Reservation);

        if (AccType) this.addedAccType = AccType;
        if (AccTxn) this.accTxn = AccTxn;

        if (AddedAsset) this.addedAsset = AddedAsset;
        if (DeletedAsset) this.deletedAsset = DeletedAsset;

        if (AddedUser) this.addedUser = AddedUser;
        if (DeletedUser) this.deletedUser = DeletedUser;

        if (AddedAssetTag) this.addedAssetTag = AddedAssetTag;
        if (DeletedAssetTag) this.deletedAssetTag = DeletedAssetTag;

        if (AddedUsrTag) this.addedUsrTag = AddedUsrTag;
        if (DeletedUsrTag) this.DeletedUsrTag = DeletedUsrTag;
    }
}

module.exports = EventDTO;