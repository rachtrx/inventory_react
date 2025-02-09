const { Op, where } = require("sequelize")
const LoanDTO = require("../dtos/loan.dto")
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const logger = require("../logging");

class UserReturnSearch {

    /**
     * Constructs a new instance of the LoanSearch class. By default, used for User and Acc search only, because it loops over loans. For assets, search is handled separately since we want to include assets that have never been loaned out, so it loops over assets themselves.
     * 
     * Issue faced is that if we join loans directly onto asset and accessory, it is difficult to tell which loan should be joint early on. EXISTS short-circuits this by returning TRUE as soon as at least one match is found, allowing the loan to be joined.
     * 
     * @param {Object} params - The parameters for initializing the LoanSearch instance.
     * @param {number|null} params.loanId - The ID of the loan to search for. Default is null.
     */
    constructor({
        userId = null,
        userName = null,
        deptId = null,
    }) {
        this.userId = userId;
        this.userName = userName;
        this.deptId = deptId;

        // EXISTS (
        //     SELECT 1
        //     FROM "loans" AS "Loans"
        //     INNER JOIN "usrs" AS "Loans->Usr"
        //     ON "Loans"."user_id" = "Loans->Usr"."id"
        //     ${this.userId ? 
        //         `WHERE "Loans->Usr"."id" = '%${this.userId}%'` : "" + this.userName ? 
        //         `WHERE "Loans->Usr"."user_name" ILIKE '%${this.userName}%'` : ""
        //     }
        // )

        this.accExistCondition = Sequelize.literal(`
            EXISTS (
                SELECT 1
                FROM "acc_loans" AS "AccLoans"
                INNER JOIN "acc_types" AS "AccLoans->AccType"
                ON "AccLoans"."accessory_type_id" = "AccLoans->AccType"."id"
                WHERE "AccLoans"."loan_id" = "Loan"."id"
                AND "AccLoans"."count" > (
                    SELECT COALESCE(SUM("AccLoans->AccReturns"."count"), 0)
                    FROM "acc_returns" AS "AccLoans->AccReturns"
                    WHERE "AccLoans->AccReturns"."acc_loan_id" = "AccLoans"."id"
                )
            )
        `)

        this.userCondition = this.userId
            ? { id : this.userId } : this.userName ? 
            { userName: { [Op.iLike]: `%${this.userName}%` } } : []
    }

    async run() {
        try {
            let query = await Loan.findAll({
                attributes: ['id', 'expectedReturnDate', 'loanEventId', 'reserveEventId', 'cancelEventId'],
                include: [
                    {
                        model: Usr,
                        where: this.userCondition,
                        attributes: ['id', 'userName', [
                            Sequelize.literal(`
                                CASE
                                    WHEN "Usr"."user_name" ILIKE '%${this.userName}%' THEN true
                                    ELSE false
                                END
                            `),
                            'isMatching'
                        ]],
                        required: true,
                        include: {
                            model: Dept,
                            attributes: ['id', 'deptName'],
                            where: this.deptId ? { id: this.deptId } : [],
                        }
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
                                attributes: ['id', 'accessoryName'],
                                where: {}
                            }
                        ],
                        where: this.accExistCondition,
                        required: false
                    },
                    {
                        model: AstLoan,
                        attributes: ['id', 'returnEventId'],
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
                ],
                where: { [Op.or]: [
                    Sequelize.literal(`EXISTS (SELECT 1 FROM "ast_loans" AS "AstLoan" WHERE "AstLoan"."loan_id" = "Loan"."id")`), // At least either unreturned asset of accessory
                    this.accExistCondition
                ] },
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

module.exports = { UserReturnSearch }