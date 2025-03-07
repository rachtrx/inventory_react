const LoanDTO = require("./loan.dto");
const RemarkDTO = require("./remark.dto");

class EventDTO {

    constructor({
        id,
        openedDate,
        expectedCloseDate,
        closedDate,
        cancelled,
        OpenedAdmin,
        ClosedAdmin,
        openedAdminId,
        closedAdminId,
        Rmks,
        Loan, // ignore returns; paired with loan
        AccType,
        AccTxn,
        Ast,
        AstDelete,
        Usr,
        UsrDelete,
        AddedAssetTag,
        DeletedAssetTag,
        AddedUsrTag,
        DeletedUsrTag
    }) {
        if (id) this.eventId = id;
        if (cancelled === true || cancelled === false) this.cancelled = cancelled;

        if (openedDate) this.openedDate = openedDate;
        if (expectedCloseDate) this.expectedCloseDate = expectedCloseDate;
        if (closedDate) this.closedDate = closedDate;

        if (OpenedAdmin) this.openedAdmin = OpenedAdmin;
        if (ClosedAdmin) this.closedAdmin = ClosedAdmin;
        if (openedAdminId) this.openedAdminId = openedAdminId;
        if (closedAdminId) this.closedAdminId = closedAdminId;

        if (Rmks) this.remarks = Rmks.map(remark => new RemarkDTO(remark));

        if (Loan) {this.loan = new LoanDTO(Loan, true)} // contains return details AssetReturn and AccReturns

        if (AccType) this.addedAccType = AccType;
        if (AccTxn) this.accTxn = AccTxn;

        if (Ast) this.addedAsset = Ast;
        if (AstDelete) this.deletedAsset = AstDelete;

        if (Usr) this.addedUser = Usr;
        if (UsrDelete) this.deletedUser = UsrDelete;

        if (AddedAssetTag) this.addedAssetTag = AddedAssetTag;
        if (DeletedAssetTag) this.deletedAssetTag = DeletedAssetTag;

        if (AddedUsrTag) this.addedUsrTag = AddedUsrTag;
        if (DeletedUsrTag) this.DeletedUsrTag = DeletedUsrTag;
    }

    isCompleted() {
        return this.closedDate && !this.cancelled ? true : false;
    }

    isScheduled() {
        return !this.closedDate ? true : false;
    }

    isCancelled() {
        return this.cancelled == null ? null :
        this.cancelled === true ? true : false;
    }
}

module.exports = EventDTO;