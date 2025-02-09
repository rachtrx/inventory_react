const EventDTO = require("./event.dto");
const LoanDTO = require("./loan.dto");

class UserDTO {

    constructor({
        id,
        userName,
        bookmarked,
        addEventId, 
        delEventId,
        remarks,
        AddEvent,
        DeleteEvent,
        Dept,
        Loans,
        UsrTagMaps=null,
        isMatching=null,
    }) {

        if (!isMatching === null) this.isMatching = isMatching;

        if (UsrTagMaps !== null) {
            this.tags = UsrTagMaps.map(usrTagMap => ({
                tagId: usrTagMap.UsrTag?.id,
                tagName: usrTagMap.UsrTag?.tagName,
                userTagId: usrTagMap.id,
                isMatching: usrTagMap.get('isMatching'),
            }))
        }

        if (remarks !== null) this.remarks = remarks;

        this.userId = id;
        this.userName = userName;

        this.bookmarked = bookmarked === null ? null : bookmarked ? true : false;

        if (addEventId) this.addEventId = addEventId;
        if (addEventId || delEventId) this.delEventId = delEventId;
        
        if (AddEvent) this.addEvent = new EventDTO(AddEvent);
        if (DeleteEvent) this.deleteEvent = new EventDTO(DeleteEvent);
        
        if (Dept?.id) this.deptId = Dept.id;
        if (Dept?.deptName) this.deptName = Dept.deptName;

        if (Loans) {
            this.loans = Loans.map(loan => new LoanDTO(loan));
        }
    }
}

module.exports = UserDTO;