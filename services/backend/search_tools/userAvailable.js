const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./loanSearch");
const UserDTO = require("../dtos/usr.dto");
const { userDeletedQuery } = require("../controllers/utils");

class UserAvilable {

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
                include: [
                    userDeletedQuery(),
                    {
                        model: Dept,
                        attributes: ['id', 'deptName'],
                        ...(this.deptId && { where: { id: this.deptId } }),
                    }
                ],
                order: Sequelize.literal(`"Usr->UsrDeletes->Event"."closed_date" IS NOT NULL AND "Usr->UsrDeletes->Event"."cancelled" = FALSE ASC`)
            })
            return query.map(usrRow => new UserDTO(usrRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { UserAvilable }