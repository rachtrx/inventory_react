const logger = require("../logging");
const LoanDTO = require("./loan.dto");
const RemarkDTO = require("./remark.dto");

class EventLogDTO {

    constructor(item) {

        const {
            id,
            adminId,
            eventDate,
            Admin,
            Rmks,
            Loan, // ignore returns; paired with loan
            Reservation,
            Cancellation,
            AssetReturn,
            AccReturns,
            AddedAsset,
            DeletedAsset,
            AddedUser,
            DeletedUser,
            AddedAstTag,
            DeletedAstTag,
            AddedUsrTag,
            DeletedUsrTag,
            AccType,
            AccTxn,
        } = item;
        if (eventDate) this.eventDate = eventDate;
        if (id) this.eventId = id;
        if (adminId) this.adminId = adminId;

        if (Admin) this.adminName = Admin.adminName;
        if (Rmks) this.remarks = Rmks.map(remark => new RemarkDTO(remark));

        if (Loan || Reservation || Cancellation) {
            const eventObj = Loan || Reservation || Cancellation;
            const items = []
            if (eventObj.AstLoan) {
                items.push(`Asset: ${eventObj.AstLoan.Ast.serialNumber}`);
            } 
            if (eventObj.AccLoans?.length > 0) {
                const accessories = eventObj.AccLoans
                    .map(accLoan => `${accLoan.AccType.accName} (${accLoan.count})`)
                    .join(', ');
                items.push(`Accessories: ${accessories}`);
            }
            const userName = eventObj.Usr.userName;
            if (Loan) {
                this.type = "Loan"
                this.description = `${items.join(' + ')} loaned by ${userName}`;
            } else if (Reservation) {
                this.type = "Reservation";
                this.description = `${items.join(' + ')} reserved for ${userName}`;
            } else {
                this.type = "Cancellation";
                this.description = `${items.join(' + ')} cancelled for ${userName}`;
            }
        } else if (AssetReturn || AccReturns?.length > 0) {
            this.type = "Return";
            this.items = []
            if (AssetReturn) {
                this.items.push(`Asset: ${AssetReturn.Ast.serialNumber}`);
            } 
            if (AccReturns.length > 0) {
                const accessories = AccReturns
                    .map(accReturn => `${accReturn.AccLoan.AccType.accessoryName} (${accReturn.count})`)
                    .join(', ');
                this.items.push(`Accessories: ${accessories}`);
            }
            const userName = AssetReturn ? 
                AssetReturn.Loan.Usr.userName :
                AccReturns[0].AccLoan.Loan.Usr.userName;
            this.description = `${this.items.join(' + ')} returned by ${userName}`;
        } else if (AccType) {
            this.type = "AddAcc";
            this.description = `Added new accessory type: ${AccType.accessoryName}`;
        } else if (AccTxn) {
            this.type = "AccTxn";
            this.description = `${AccTxn.AccType.accessoryName} quantity changed by ${AccTxn.count > 0 ? `+${AccTxn.count}` : AccTxn.count}`;
        } else if (AddedAsset) {
            this.type = "AddAst";
            this.description = `New Asset added: ${AddedAsset.serialNumber} (${AddedAsset.AstSType.AstType.typeName} / ${AddedAsset.AstSType.subTypeName})`;
        } else if (DeletedAsset) {
            this.type = "DelAst";
            this.description = `Asset condemned: ${DeletedAsset.serialNumber} (${DeletedAsset.AstSType.AstType.typeName} / ${DeletedAsset.AstSType.subTypeName})`;
        } else if (AddedUser) {
            this.type = "AddUsr";
            this.description = `New User added: ${AddedUser.userName} (${AddedUser.Dept.deptName})`;
        } else if (DeletedUser) {
            this.type = "DelUsr";
            this.description = `User deleted: ${DeletedUser.userName} (${DeletedUser.Dept.deptName})`;
        } else if (AddedAstTag) {
            this.type = "AddAstTag";
            this.description = `Tag "${AddedAstTag.AstTag.tagName}" added for (${AddedAstTag.Ast.serialNumber})`
c        } else if (DeletedAstTag) {
            this.type = "DelAstTag";
            this.description = `Tag "${DeletedAstTag.AstTag.tagName}" removed for (${DeletedAstTag.Ast.serialNumber})`
        } else if (AddedUsrTag) {
            this.type = "AddUsrTag";
            this.description = `Tag "${AddedUsrTag.UsrTag.tagName}" added for (${AddedUsrTag.Usr.userName})`
        } else if (DeletedUsrTag) {
            this.type = "DelUsrTag";
            this.description = `Tag "${DeletedUsrTag.UsrTag.tagName}" removed for (${DeletedUsrTag.Usr.userName})`;
        } else {
            logger.info(item.get({ plain: true }))
            // throw new Error("Unexpected event type found.")
        }
    }
}

module.exports = EventLogDTO;