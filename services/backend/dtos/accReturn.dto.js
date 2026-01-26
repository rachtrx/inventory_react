const EventDTO = require("./event.dto");

class AccReturnDTO {

    constructor({
        id,
        accLoanId,
        count,
        returnEventId,
        ReturnEvent
    }) {
        this.returnEventId = returnEventId;
        this.count = count;
        this.accReturnId = id;
        this.accLoanId = accLoanId;
        this.returnEvent = ReturnEvent && new EventDTO(ReturnEvent.dataValues);
    }
} 

module.exports = AccReturnDTO;