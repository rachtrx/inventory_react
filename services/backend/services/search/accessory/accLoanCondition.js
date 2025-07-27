const { Op } = require("sequelize");

class AccLoanCondition {

    constructor(condition) {
        if( ("accessoryNames" in condition) && ("accTypeIds" in condition))
            throw new Error("Accessory Loan cannot search both IDs and names")

        this.query = []

        let values;
        let fieldName;

        if ("accessoryNames" in condition) {
            values = condition["accessoryNames"]
            fieldName = "accessoryName"
        } else if ("accTypeIds" in condition) {
            values = condition["accTypeIds"]
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

module.exports = { AccLoanCondition }