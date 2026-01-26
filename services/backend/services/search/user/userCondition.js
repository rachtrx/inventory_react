const { Op } = require("sequelize");

class UserCondition {

    constructor(condition) {
        if(("userNames" in condition) && ("userIds" in condition))
            throw new Error("User Loan cannot search both IDs and names")

        this.query = []

        let values;
        let fieldName;

        if ("userNames" in condition) {
            values = condition["userNames"]
            fieldName = "userName"
        } else if ("userIds" in condition) {
            values = condition["userIds"]
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

module.exports = { UserCondition }