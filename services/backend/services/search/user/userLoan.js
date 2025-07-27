const { Op } = require("sequelize");
const { Usr, Dept, Sequelize } = require("@models");
const AssetDTO = require("@dtos/ast.dto");
const logger = require("@/utils/logging");
const UserDTO = require("@dtos/usr.dto");
const { UserCondition } = require("./userCondition");

class UserLoan {

    constructor({
        userId = null,
        deptId = null,
        ...identifiers
    }) {
        this.userCondition = new UserCondition(identifiers);
        this.userId = userId
        this.deptId = deptId
    }

    async run() {
        try {
            const query = await Usr.findAll({
                attributes: ['id', 'userName', 'delEventId'],
                where: this.userCondition.query,
                include: {
                    model: Dept,
                    attributes: ['id', 'deptName'],
                    ...(this.deptId && { where: { id: this.deptId } }),
                },
                order: Sequelize.literal(`"Usr"."del_event_id" IS NOT NULL DESC`)
            })
            return query.map(usrRow => new UserDTO(usrRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { UserLoan }