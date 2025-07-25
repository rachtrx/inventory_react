const { Op } = require("sequelize");
const { Usr, Dept, Sequelize } = require("@models");
const AssetDTO = require("@dtos/ast.dto");
const logger = require("@/utils/logging");
const UserDTO = require("@dtos/usr.dto");

class UserLoan {

    constructor({
        userNames = "",
        userId = null,
        deptId = null,
    }) {
        this.userNames = userNames
        this.userId = userId
        this.deptId = deptId

        const isBulkSearch = Array.isArray(userNames) 
        logger.info(userNames)

        this.userCondition = isBulkSearch
            ? { userName: { [Op.in]: userNames } }
            : { userName: { [Op.iLike]: `%${userNames}%` } };

        this.isBulkSearch = isBulkSearch
    }

    async run() {
        try {
            const query = await Usr.findAll({
                attributes: ['id', 'userName', 'delEventId'],
                where: this.userCondition,
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