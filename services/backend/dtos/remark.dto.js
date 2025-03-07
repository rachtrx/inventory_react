class RemarkDTO {

    constructor({
        id,
        eventId,
        text,
        remarkDate,
        adminId,
        Admin
    }) {
        this.id = id;
        this.eventId = eventId;
        this.text = text;
        this.remarkDate = remarkDate;
        this.adminId = adminId;

        if (Admin) this.admin = Admin;
    }
}

module.exports = RemarkDTO;