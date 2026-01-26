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
        if (remarkDate) this.remarkDate = remarkDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Singapore"
        })

        this.adminId = adminId;


    }
}

module.exports = RemarkDTO;