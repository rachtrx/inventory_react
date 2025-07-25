const { Op } = require("sequelize");
const { AccLoanSearch } = require("./accLoan");

class AccLoanByIdSearch extends AccLoanSearch {

    constructor({accTypeIds}) {
        super()

        this.accTypeIds = accTypeIds;

        this.accessoryCondition = Array.isArray(accTypeIds)
            ? { id: { [Op.in]: accTypeIds } } 
            : { id: accTypeIds };
    }
}

module.exports = { AccLoanByIdSearch }