const { Op } = require("sequelize");
const { Sequelize } = require("../models");
const { ReturnSearch } = require("./return");

class UserReturnSearch extends ReturnSearch {

    constructor({
        userId = null,
        userName = null,
        deptId = null,
    }) {
        super({})
        this.userId = userId;
        this.userName = userName;
        this.deptId = deptId;

        if (!this.userName) return;

        this.userAttributes.push([
            Sequelize.literal(`
                CASE
                    WHEN "UsrLoans->Usr"."user_name" ILIKE '%${this.userName}%' THEN true
                    ELSE false
                END
            `),
            'isMatching'
        ]);
    }

    generateLoanRequirements() {

        const otherUserLoanConditions = this.userId ? 
        `AND "UsrLoans->Usr"."id" = '%${this.userId}%'` : "" + this.userName ? 
        `AND "UsrLoans->Usr"."user_name" ILIKE '%${this.userName}%'` : ""

        this.generateAccLoanRequirements()
        this.generateUserLoanRequirements(otherUserLoanConditions)

        this.loanRequirements.push({ [Op.or]: [
            Sequelize.literal(`EXISTS (SELECT 1 FROM "ast_loans" AS "AstLoan" WHERE "AstLoan"."loan_id" = "${this.loanModelAssociation}"."id")`), // At least either unreturned asset of accessory
            this.accessoryLoanConditions
        ] })
    }

    updateQueries() {
        if (this.userId) this.userQuery.include.where.id = this.userId;
        if (this.userName) this.userQuery.include.where.userName = { [Op.iLike]: `%${this.userName}%` }
        if (this.deptId) this.userQuery.include.include.where.id = deptId
    }
}

module.exports = { UserReturnSearch };