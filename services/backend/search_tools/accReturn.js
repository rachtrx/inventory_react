const { Op, where } = require("sequelize")
const LoanDTO = require("../dtos/loan.dto")
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const logger = require("../logging");

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

        this.accExistCondition = Sequelize.literal(`
            EXISTS ( -- Get all returns under the accloan ID
                SELECT 1
                FROM "acc_loans" AS "AccLoan"
                LEFT OUTER JOIN "acc_returns" AS "AccReturns" ON "AccReturns"."acc_loan_id" = "AccLoan"."id"
                ${this.accessoryName ? 'JOIN "acc_types" AS "AccLoan->AccType" ON "AccLoan->AccType"."id" = "AccLoan"."accessory_type_id"' : ""}
                ${this.accessoryName ? `AND "AccLoan->AccType"."accessory_name" ILIKE '%${this.accessoryName}%'` : 
                    this.accessoryTypeId? `AND "AccLoan"."accessory_type_id" = ${this.accessoryTypeId}` : "" }
                WHERE "AccLoan"."id" = "AccLoans"."id"
                GROUP BY "AccLoan"."id"
                HAVING COALESCE(SUM("AccReturns"."count"), 0) < "AccLoan"."count"
            )
        `)
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
            return query.map(loanRow => new LoanDTO(loanRow));
        } catch(e) {
            throw e;
        };
    }
}

module.exports = { AccReturnSearch }
