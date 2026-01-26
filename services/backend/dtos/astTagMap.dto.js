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
        console.log(id);
        console.log(isMatching);
        if (assetId) this.assetId = assetId;
        if (tagId) this.tagId = tagId;
        if (isMatching !== undefined) this.isMatching = isMatching;

        const AssetDTO = require("./ast.dto");
        if (Ast) this.asset = new AssetDTO(Ast.dataValues);

        if (AstTag) {
            this.tagId = AstTag?.id;
            this.tagName = AstTag?.tagName;
        }
    }
}
  
module.exports = AssetTagMapDTO;