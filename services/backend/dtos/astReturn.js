const EventDTO = require("./event.dto");

class AstReturnDTO {

    constructor({
        id,
        astLoanId,
        Event
    }) {
        if (id) this.accReturnId = id;
        if (astLoanId) this.astLoanId = astLoanId;
        if (Event) this.event = new EventDTO(Event);
    }
} 

module.exports = AstReturnDTO;