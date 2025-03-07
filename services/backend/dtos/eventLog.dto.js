const logger = require("../logging");
const LoanDTO = require("./loan.dto");
const RemarkDTO = require("./remark.dto");

class EventLogDTO {

    constructor(item) {

        const {
            id,
            openedDate,
            expectedCloseDate,
            closedDate,
            cancelled,
            OpenedAdmin,
            ClosedAdmin,
            Rmks,
            Loan,
            AstReturn,
            AccReturns,
            Ast,
            AstDelete,
            Usr,
            UsrDelete,
            AddedAstTag,
            DeletedAstTag,
            AddedUsrTag,
            DeletedUsrTag,
            AccType,
            AccTxn,
        } = item;
        if (id) this.eventId = id;
        if (openedDate) this.openedDate = openedDate;
        if (expectedCloseDate) this.expectedCloseDate = expectedCloseDate;
        if (closedDate) this.closedDate = closedDate;
        if (cancelled != null) this.cancelled = cancelled;

        if (OpenedAdmin) this.openedAdminName = OpenedAdmin.adminName;
        if (ClosedAdmin) this.closedAdminName = ClosedAdmin.adminName;
        if (Rmks) this.remarks = Rmks.map(remark => new RemarkDTO(remark));

        // TODO INDICATE COMPLETED OR CANCELLED OR RESERVED!

        if (Loan) {
            const items = []
            if (Loan.AstLoan) {
                items.push(`Asset: ${Loan.AstLoan.Ast.serialNumber}`);
            } 
            if (Loan.AccLoans?.length > 0) {
                const accessories = Loan.AccLoans
                    .map(accLoan => `${accLoan.AccType.accName} (${accLoan.count})`)
                    .join(', ');
                items.push(`Accessories: ${accessories}`);
            }
            const userName = Loan.Usr.userName;
            if (!closedDate) {
                this.type = "Reservation";
                this.description = `${items.join(' + ')} reserved for ${userName}`;
            } else if (!cancelled) {
                this.type = "Loan"
                this.description = `${items.join(' + ')} loaned by ${userName}`;
            } else {
                this.type = "Cancellation";
                this.description = `${items.join(' + ')} cancelled for ${userName}`;
            }
        } else if (AstReturn || AccReturns?.length > 0) {
            this.type = "Return";
            this.items = []
            if (AstReturn) {
                this.items.push(`Asset: ${AstReturn.AstLoan.Ast.serialNumber}`);
            } 
            if (AccReturns.length > 0) {
                const accessories = AccReturns
                    .map(accReturn => `${accReturn.AccLoan.AccType.accessoryName} (${accReturn.count})`)
                    .join(', ');
                this.items.push(`Accessories: ${accessories}`);
            }
            const userName = AstReturn ? 
                AstReturn.AstLoan.Loan.Usr.userName :
                AccReturns[0].AccLoan.Loan.Usr.userName;
            this.description = `${this.items.join(' + ')} returned by ${userName}`;
        } else if (AccType) {
            this.type = "AddAcc";
            this.description = `Added new accessory type: ${AccType.accessoryName}`;
        } else if (AccTxn) {
            this.type = "AccTxn";
            this.description = `${AccTxn.AccType.accessoryName} quantity changed by ${AccTxn.count > 0 ? `+${AccTxn.count}` : AccTxn.count}`;
        } else if (Ast) {
            
            this.type = "AddAst";
            this.description = `New Asset added: ${Ast.serialNumber} (${Ast.AstSType.AstType.typeName} / ${Ast.AstSType.subTypeName})`;
        } else if (AstDelete) {
            this.type = "DelAst";
            this.description = `Asset condemned: ${AstDelete.Asset.serialNumber} (${AstDelete.Asset.AstSType.AstType.typeName} / ${AstDelete.Asset.AstSType.subTypeName})`;
        } else if (Usr) {
            this.type = "AddUsr";
            this.description = `New User added: ${Usr.userName} (${Usr.Dept.deptName})`;
        } else if (UsrDelete) {
            this.type = "DelUsr";
            this.description = `User deleted: ${UsrDelete.Usr.userName} (${UsrDelete.Usr.Dept.deptName})`;
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

        if (!closedDate) {
            this.type = "Reservation";
        } else if (!cancelled) {
            this.type = "Loan"
        } else {
            this.type = "Cancellation";
        }
    }
}

module.exports = EventLogDTO;