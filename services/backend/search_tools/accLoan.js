const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./allReturn");
const UserDTO = require("../dtos/usr.dto");
const AccTypeDTO = require("../dtos/accType.dto");

class AccLoanSearch {

    constructor({
        accessoryNames = "",
        accessoryId = null,
    }) {
        this.accessoryId = accessoryId

        // console.log(accessoryNames);

        const isBulkSearch = Array.isArray(accessoryNames) 
        
        if (isBulkSearch) {
            this.accessoryNames = accessoryNames.map(name => name.toLowerCase());
        
            this.accessoryCondition = {
                [Op.or]: this.accessoryNames.map(name => ({
                    // Postgres-specific: LOWER(dbField) = lowerInput
                    [Op.and]: Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('accessory_name')),
                        name
                    )
                }))
            };
        } else {
            const lowered = accessoryNames.toLowerCase();
        
            this.accessoryNames = lowered;
        
            this.accessoryCondition = Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('accessory_name')),
                {
                    [Op.like]: `%${lowered}%`  // partial match, case-insensitive
                }
            );
        }
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