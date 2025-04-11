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

        const names = Array.isArray(accessoryNames)
            ? accessoryNames.map(name => name.toLowerCase())
            : [accessoryNames.toLowerCase()];

        this.accessoryNames = Array.isArray(accessoryNames) ? names : names[0];

        this.accessoryCondition = Array.isArray(accessoryNames)
            ? {
                [Op.or]: names.map(name =>
                    Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('accessory_name')),
                    name
                    )
                )
            } : Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('accessory_name')),
                {
                    [Op.like]: `%${names[0]}%`
                }
            );
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