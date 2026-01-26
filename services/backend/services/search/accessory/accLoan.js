const { Op } = require("sequelize");
const { AccType, Sequelize, } = require("@models");
const logger = require("@/utils/logging");
const AccTypeDTO = require("@dtos/accType.dto");

class AccLoanSearch {

    async run() {
        try {
            const query = await AccType.findAll({
                attributes: ['id', 'accessoryName', 'stock'],
                order: Sequelize.literal(`"AccType"."stock" DESC`)
            })
            return query.map(accRow => new AccTypeDTO(accRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AccLoanSearch }