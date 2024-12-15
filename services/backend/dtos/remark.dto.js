class RemarkDTO {

    constructor({
        id,
        eventId,
        text,
        remarkDate,
        adminId
    }) {
        this.eventId = eventId;
        this.text = text;
        this.remarkDate = remarkDate;
        this.adminId = adminId;
    }
}

module.exports = RemarkDTO;