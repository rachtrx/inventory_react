const { Op } = require("sequelize");
const { AccType, Sequelize, } = require("@models");
const logger = require("@/utils/logging");
const AccTypeDTO = require("@dtos/accType.dto");
const { AccLoanCondition } = require("./accLoanCondition");

class AccLoanSearch {

    constructor(condition) {
        this.condition = new AccLoanCondition(condition)
    }

    async run() {
        try {
            const query = await AccType.findAll({
                attributes: ['id', 'accessoryName', 'stock'],
                where: { [Op.and] : [
                    this.condition.query
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