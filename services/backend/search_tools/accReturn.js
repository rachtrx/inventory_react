const { Op, where } = require("sequelize")
const LoanDTO = require("../dtos/loan.dto")
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const logger = require("../logging");
const { successfulEventCondition, assetReturnedQuery } = require("../controllers/utils");

class AccReturnSearch {

    /**
     * Constructs a new instance of the LoanSearch class. By default, used for User and Acc search only, because it loops over loans. For assets, search is handled separately since we want to include assets that have never been loaned out, so it loops over assets themselves.
     * 
     * Issue faced is that if we join loans directly onto asset and accessory, it is difficult to tell which loan should be joint early on. EXISTS short-circuits this by returning TRUE as soon as at least one match is found, allowing the loan to be joined.
     * 
     * @param {Object} params - The parameters for initializing the LoanSearch instance.
     * @param {number|null} params.loanId - The ID of the loan to search for. Default is null.
     */
    constructor({
        accessoryTypeId = null,
        accessoryName = null, 
    }) {
        this.accessoryTypeId = accessoryTypeId
        this.accessoryName = accessoryName

        this.accExistCondition = Sequelize.literal(`
            "AccLoans"."id" IN (
                SELECT id
                FROM "acc_loans" AS "AccLoans"
                INNER JOIN "acc_types" AS "AccLoans->AccType"
                ON "AccLoans"."accessory_type_id" = "AccLoans->AccType"."id"
                WHERE "AccLoans"."loan_id" = "Loan"."id"
                ${this.accessoryTypeId ? 
                    `AND "AccLoans->AccType"."id" = '%${this.accessoryTypeId}%'` : "" + this.accessoryName ? 
                    `AND "AccLoans->AccType"."accessory_name" ILIKE '%${this.accessoryName}%'` : ""}
                AND "AccLoans"."count" > (
                    SELECT COALESCE(SUM("AccLoans->AccReturns"."count"), 0)
                    FROM "acc_returns" AS "AccLoans->AccReturns"
                    WHERE "AccLoans->AccReturns"."acc_loan_id" = "AccLoans"."id"
                )
            )
        `)

        this.accCondition = this.accessoryTypeId
        ? { id : this.accessoryTypeId } : this.accessoryName ? 
        { accessoryName: { [Op.iLike]: `%${this.accessoryName}%` } } : []
    }

    async run() {
        try {
            let query = await Loan.findAll({
                attributes: ['id'],
                include: [
                    {
                        model: Event,
                        where: successfulEventCondition(),
                        required: true // IMPT
                    },
                    {
                        model: AccLoan,
                        attributes: ['id', 'count'],
                        include: [
                            {
                                model: AccReturn,
                                attributes: ['id', 'count']
                            },
                            {
                                model: AccType,
                                attributes: ['id', 'accessoryName', [
                                    Sequelize.literal(`
                                        CASE
                                            WHEN "AccLoans->AccType"."accessory_name" ILIKE '%${this.accessoryName}%' THEN true
                                            ELSE false
                                        END
                                    `),
                                    'isMatching'
                                ]],
                                where: {}
                            }
                        ],
                        where: this.accExistCondition,
                        required: true // IMPT
                    },
                    {
                        model: AstLoan,
                        attributes: ['id'],
                        include: [
                            assetReturnedQuery(),
                            {
                                model: Ast,
                                attributes: ['id', 'serialNumber', 'assetTag'],
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
                            }
                        ],
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
            return query.map(loanRow => new LoanDTO(loanRow));
        } catch(e) {
            throw e;
        };
    }
}

module.exports = { AccReturnSearch }