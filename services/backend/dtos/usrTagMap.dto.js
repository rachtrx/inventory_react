class UserTagMapDTO {

    constructor({
        id,
        userId,
        tagId,
        Usr,
        UsrTag,
        isMatching
    }) {
        if (id) this.assetTagId = id;
        
        if (userId) this.userId = userId;
        if (tagId) this.tagId = tagId;
        if (isMatching) this.isMatching = isMatching;

        const UserDTO = require("./usr.dto");
        if (Usr) this.user = new UserDTO(Usr);

        if (UsrTag) {
            this.tagId = UsrTag?.id;
            this.tagName = UsrTag?.tagName;
        }
    }
}
  
module.exports = UserTagMapDTO;