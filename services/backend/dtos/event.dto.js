const LoanDTO = require("./loan.dto");
const RemarkDTO = require("./remark.dto");

class EventDTO {

    constructor({
        id,
        adminId,
        eventDate,
        Admin,
        Rmks,
        AddedAsset,
        DeletedAsset,
        Loan,
        Reservation
    }) {
        if (eventDate) this.eventDate = eventDate;
        if (id) this.eventId = id;
        if (adminId) this.adminId = adminId;

        if (Admin) this.adminName = Admin.adminName;
        if (Rmks) this.remarks = Rmks.map(remark => new RemarkDTO(remark));

        if (Loan) this.loan = new LoanDTO(Loan)
        if (Reservation) this.reservation = new LoanDTO(Reservation);

        if (AddedAsset) this.addedAsset = AddedAsset;
        if (DeletedAsset) this.deletedAsset = DeletedAsset;
    }
}

module.exports = EventDTO;