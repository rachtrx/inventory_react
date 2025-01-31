const { Op } = require("sequelize");
const { AccType, Sequelize } = require("../models");
const { ReturnSearch } = require("./return");

class AccessoryReturnSearch extends ReturnSearch {

    constructor({
        accessoryTypeId = null,
        accessoryName = null, 
    }) {
        super({});
        this.accessoryTypeId = accessoryTypeId
        this.accessoryName = accessoryName

        if (!this.accessoryName) return;

        if (this.accessoryName) {
            this.accessoryAttributes.push([
                Sequelize.literal(`
                    CASE
                        WHEN "AccLoans->AccType"."accessory_name" ILIKE '%${this.accessoryName}%' THEN true
                        ELSE false
                    END
                `),
                'isMatching'
            ])
        }

        this.order = this.accessoryName ? Sequelize.literal(`
            "AstLoan"."id" IS NULL DESC
        `) : []; // TODO: Most likely the order should be ascending for NO ASSET if acc search
    }

    generateLoanRequirements() {

        const otherAccLoanConditions = this.accessoryTypeId ? 
            `AND "AccLoans->AccType"."id" = '%${this.accessoryTypeId}%'` : "" + this.accessoryName ? 
            `AND "AccLoans->AccType"."accessory_name" ILIKE '%${this.accessoryName}%'` : ""

        this.generateUserLoanRequirements();
        this.generateAccLoanRequirements(otherAccLoanConditions);

        this.loanRequirements.push(this.accessoryLoanConditions) // unreturned accessory needed
    }

    updateQueries() {
        const accTypeModelQuery = this.accessoryQuery.include.find(model => model.model.name === AccType.name)
        if (this.accessoryTypeId) accTypeModelQuery.where.id = this.accessoryTypeId;
        if (this.accessoryName) accTypeModelQuery.where.accessoryName = { [Op.iLike]: `%${this.accessoryName}%` };
        this.accessoryQuery.required = true;
    }
}

module.exports = { AccessoryReturnSearch };