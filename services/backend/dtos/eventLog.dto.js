const { FormType } = require("../controllers/utils");
const logger = require("../logging");
const AccTypeDTO = require("./accType.dto");
const AssetDTO = require("./ast.dto");
const AssetTagMapDTO = require("./astTagMap.dto");
const RemarkDTO = require("./remark.dto");
const UserDTO = require("./usr.dto");
const UserTagMapDTO = require("./usrTagMap.dto");

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
        if (eventDate) {
            this.eventDate = new Date(eventDate).toLocaleString("en-SG", {
                timeZone: "Asia/Singapore",
            });
        }

        if (id) this.eventId = id;

        if (Admin) {
            this.adminName = Admin.adminName;
            this.adminId = Admin.id;
        }
        if (Rmks) this.remarks = Rmks.map(remark => new RemarkDTO(remark));

        let asset;
        let user;
        let accessories;
        let tag;

        if (Loan || Reservation || Cancellation) {
            const eventObj = Loan || Reservation || Cancellation;

            if (eventObj.AstLoan) {
                asset = eventObj.AstLoan.asset;
            } 
            if (eventObj.AccLoans?.length > 0) {
                accessories = eventObj.AccLoans
                    .map(accLoan => ({ accessoryType: accLoan.AccType, count: accLoan.count }))
                }
                user = eventObj.Usr;
            if (Loan) {
                this.type = FormType.LOAN
            } else if (Reservation) {
                this.type = FormType.RESERVE
            } else {
                this.type = FormType.CANCEL
            }
        } else if (AssetReturn || AccReturns?.length > 0) {
            this.type = FormType.RETURN;
            if (AssetReturn) {
                asset = AssetReturn.Ast;
            } 
            if (AccReturns.length > 0) {
                accessories = AccReturns
                    .map(accReturn => ({accessoryType: accReturn.AccLoan.AccType, count: accReturn.count}))
            }
            user = AssetReturn ? 
                AssetReturn.Loan.Usr :
                AccReturns[0].AccLoan.Loan.Usr;
        } else if (AccType || AccTxn) {
            this.type = FormType.UPDATE_ACC;
            if (AccType && AccTxn) accessories = [{accessoryType: AccType, count: AccTxn.count}]
            else if (AccType) accessories = [{accessoryType: AccType, count: 0}]
            else if (AccTxn) accessories = [{accessoryType: AccTxn.AccType, count: AccTxn.count}]
        } else if (AddedAsset) {
            this.type = FormType.ADD_ASSET;
            asset = AddedAsset;
        } else if (DeletedAsset) {
            this.type = FormType.DEL_ASSET;
            asset = DeletedAsset;
        } else if (AddedUser) {
            this.type = FormType.ADD_USER;
            user = AddedUser;
        } else if (DeletedUser) {
            this.type = FormType.DEL_USER;
            user = DeletedUser;
        } else if (AddedAstTag) {
            this.type = FormType.TAG_ASSET;
            asset = AddedAstTag.Ast;
            tag = AddedAstTag;
        } else if (DeletedAstTag) {
            this.type = FormType.UNTAG_ASSET;
            asset = DeletedAstTag.Ast;
            tag = DeletedAstTag;
        } else if (AddedUsrTag) {
            this.type = FormType.TAG_USER;
            user = AddedUsrTag.Usr;
            tag = AddedUsrTag;
        } else if (DeletedUsrTag) {
            this.type = FormType.UNTAG_USER;
            user = DeletedUsrTag.Usr;
            tag = DeletedUsrTag;
        } else {
            logger.info(item.get({ plain: true }))
            throw new Error("Unexpected event type found.")
        }

        if (asset) this.asset = new AssetDTO(asset);
        if (user) this.user = new UserDTO(user);
        if (accessories) this.accessories = accessories.map(({accessoryType, count}) => ({
            accessoryType: new AccTypeDTO(accessoryType),
            count
        }))
        if (tag) {
            if (tag.AstTag) this.tags = [new AssetTagMapDTO(tag)];
            else if (tag.UsrTag) this.tags = [new UserTagMapDTO(tag)];
            else throw new Error(`Unexpected tag found: ${tag}`);
        }
    }
}

module.exports = EventLogDTO;