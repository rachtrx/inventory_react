const EventDTO = require("./event.dto");

class AccReturnDTO {

    constructor({
        id,
        accLoanId,
        count,
        Event
    }) {
        // if (returnEventId) this.returnEventId = returnEventId;
        if (id) this.accReturnId = id;
        if (accLoanId) this.accLoanId = accLoanId;
        if (count) this.count = count;
        if (Event) this.event = new EventDTO(Event);
    }
} 

module.exports = AccReturnDTO;