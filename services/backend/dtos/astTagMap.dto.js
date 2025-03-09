

class AssetTagMapDTO {

    constructor({
        id,
        assetId,
        tagId,
        Ast,
        AstTag,
        isMatching
    }) {
        if (id) this.assetTagId = id;

        if (assetId) this.assetId = assetId;
        if (tagId) this.tagId = tagId;
        if (isMatching) this.isMatching = isMatching;

        const AssetDTO = require("./ast.dto");
        if (Ast) this.asset = new AssetDTO(Ast);

        if (AstTag) {
            this.tagId = AstTag?.id;
            this.tagName = AstTag?.tagName;
        }
    }
}
  
module.exports = AssetTagMapDTO;