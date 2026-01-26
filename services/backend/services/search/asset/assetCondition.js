const { Op } = require("sequelize");

class AssetCondition {

    constructor(condition) {
        if(("serialNumbers" in condition) && ("assetIds" in condition))
            throw new Error("Asset Loan cannot search both IDs and names")

        this.query = []

        let values;
        let fieldName;

        if ("serialNumbers" in condition) {
            values = condition["serialNumbers"]
            fieldName = "serialNumber"
        } else if ("assetIds" in condition) {
            values = condition["assetIds"]
            fieldName = "id"
        }

        const isBulkSearch = Array.isArray(values);

        if ((!isBulkSearch && values) || values?.length) {
            this.query = isBulkSearch
                ? { [fieldName]: { [Op.in]: values } }
                : { [fieldName]: { [Op.iLike]: `%${values}%` } };
        } else this.query = []        
    }
}

module.exports = { AssetCondition }