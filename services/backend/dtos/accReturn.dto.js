const EventDTO = require("./event.dto");

class AccReturnDTO {

    constructor({
        id,
        accLoanId,
        count,
        returnEventId,
        ReturnEvent
    }) {
        if (returnEventId) this.returnEventId = returnEventId;
        if (id) this.accReturnId = id;
        if (accLoanId) this.accLoanId = accLoanId;
        this.count = count;
        this.returnEvent = new EventDTO(ReturnEvent);
    }
} 

module.exports = AccReturnDTO;