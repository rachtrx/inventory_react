const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./loanSearch");
const UserDTO = require("../dtos/usr.dto");
const AccTypeDTO = require("../dtos/accType.dto");

class AccLoanSearch {

    constructor({
        accessoryNames = "",
        accessoryId = null,
    }) {
        this.accessoryId = accessoryId

        const isBulkSearch = Array.isArray(accessoryNames) 
        
        this.accessoryNames = isBulkSearch
            ? accessoryNames.map(name => name.toLowerCase())  // Convert array items to lowercase
            : accessoryNames.toLowerCase();

        logger.info(accessoryNames)

        this.accessoryCondition = isBulkSearch
            ? { accessoryName: { [Op.in]: this.accessoryNames } }
            : { accessoryName: { [Op.iLike]: `%${this.accessoryNames}%` } };

        this.isBulkSearch = isBulkSearch
    }

    async run() {
        try {
            const query = await AccType.findAll({
                attributes: ['id', 'accessoryName', 'stock'],
                where: { [Op.and] : [
                    this.accessoryCondition
                ]},
                order: Sequelize.literal(`"AccType"."stock" DESC`)
            })
            return query.map(accRow => new AccTypeDTO(accRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AccLoanSearch }