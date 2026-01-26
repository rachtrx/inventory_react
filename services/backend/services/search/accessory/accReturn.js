const { Op, where } = require("sequelize")
const LoanDTO = require("@dtos/loan.dto")
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("@models");
const logger = require("@/utils/logging");

class AccReturnSearch {

    constructor({
        accessoryTypeId = null,
        accessoryName = null, 
    }) {
        this.accessoryTypeId = accessoryTypeId;
        this.accessoryName = accessoryName;
        
        this.accCondition = this.accessoryTypeId
        ? { id : this.accessoryTypeId } : this.accessoryName ? 
        { accessoryName: { [Op.iLike]: `%${this.accessoryName}%` } } : []

        this.accTypeAttributes = ['id', 'accessoryName']

        if (accessoryName) {
            this.accTypeAttributes.push([
                Sequelize.literal(`
                    CASE
                        WHEN "AccLoans->AccType"."accessory_name" ILIKE '%${accessoryName}%' THEN true
                        ELSE false
                    END
                `),
                'isMatching'
            ])
        }

        this.accExistCondition = {
            [Op.or]: [
                Sequelize.literal(`
                    "AccLoans"."id" IS NOT NULL 
                    AND NOT EXISTS (
                    SELECT 1 FROM "acc_returns" AS "AccReturns"
                    ${this.accessoryName ? 'JOIN "acc_types" AS "AccLoans->AccType" ON "AccLoans->AccType"."id" = "AccLoans"."accessory_type_id"' : ""}
                    ${this.accessoryName ? `AND "AccLoans->AccType"."accessory_name" ILIKE '%${this.accessoryName}%'` : 
                        this.accessoryTypeId? `AND "AccLoans"."accessory_type_id" = ${this.accessoryTypeId}` : "" }
                    WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
                )`),
                Sequelize.literal(`EXISTS (
                    SELECT 1 FROM "acc_returns" AS "AccReturns"
                    ${this.accessoryName ? 'JOIN "acc_types" AS "AccLoans->AccType" ON "AccLoans->AccType"."id" = "AccLoans"."accessory_type_id"' : ""}
                    ${this.accessoryName ? `AND "AccLoans->AccType"."accessory_name" ILIKE '%${this.accessoryName}%'` : 
                        this.accessoryTypeId? `AND "AccLoans"."accessory_type_id" = ${this.accessoryTypeId}` : "" }
                    WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
                    GROUP BY "AccLoans"."id"
                    HAVING COALESCE(SUM("AccReturns"."count"), 0) < "AccLoans"."count"
                )`)
            ]
        }
    }

    async run() {
        try {
            let query = await Loan.findAll({
                    include: [
                        {
                            model: AccLoan,
                            include: [
                                {
                                    model: AccReturn,
                                },
                                {
                                    model: AccType,
                                    attributes: this.accTypeAttributes,
                                    required: true
                                }
                            ],
                            where: this.accExistCondition, // IMPT
                            required: true, // IMPT
                        },
                        {
                            model: AstLoan,
                            include: {
                                model: Ast,
                                attributes: ['id', 'serialNumber', 'alias'],
                                include: {
                                    model: AstSType,
                                    attributes: ['subTypeName'],
                                    include: {
                                        model: AstType,
                                        attributes: ['typeName'],                           
                                        required: true,
                                    },
                                    required: true,
                                },
                            },
                            required: false
                        },
                        {
                            model: Usr,
                            attributes: ['id', 'userName'],
                            where: [],
                            include: {
                                model: Dept,
                                attributes: ['id', 'deptName'],
                                where: {},
                            },
                            required: true
                        }
                    ],
                    order: this.accessoryName ? Sequelize.literal(`
                        "AstLoan"."id" IS NULL DESC
                    `) : []
            });
            return query.map(loanRow => new LoanDTO(loanRow.dataValues));
        } catch(e) {
            throw e;
        };
    }
}

module.exports = { AccReturnSearch }
