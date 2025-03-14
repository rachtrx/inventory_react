const { Op, where } = require("sequelize")
const LoanDTO = require("../dtos/loan.dto")
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, Event } = require("../models");
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

        this.accExistCondition = Sequelize.literal(`
            NOT EXISTS (
                SELECT 1
                FROM "acc_returns" AS "AccReturns"
                WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
                GROUP BY "AccLoans"."id"
                HAVING COALESCE(SUM("AccReturns"."count"), 0) = "AccLoans"."count"
            )
        `)

        this.userCondition = this.userId
            ? { id : this.userId } : this.userName ? 
            { userName: { [Op.iLike]: `%${this.userName}%` } } : []
    }

    async run() {
        try {
            let query = await Loan.findAll({
                include: [
                    {
                        model: Event,
                        as: 'LoanEvent',
                        required: true
                    },
                    {
                        model: Usr,
                        where: this.userCondition,
                        attributes: ['id', 'userName'],
                        required: true,
                        include: {
                            model: Dept,
                            attributes: ['id', 'deptName'],
                            where: this.deptId ? { id: this.deptId } : [],
                        }
                    },
                    {
                        model: AccLoan,
                        include: [
                            {
                                model: AccReturn,
                            },
                            {
                                model: AccType,
                                attributes: ['id', 'accessoryName'],
                                where: {}
                            }
                        ],
                        required: false
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
                ],
                where: { [Op.and]: [ // delete any user rows that doesnt meet the condition
                    Sequelize.literal(`
                        NOT EXISTS (
                            SELECT 1 FROM "ast_loans" AS "AstLoans"
                            WHERE "AstLoans"."id" = "AstLoan"."id"
                            AND "AstLoans"."return_event_id" IS NOT NULL -- asset returned
                        )
                    `), // At least either unreturned asset of accessory
                    this.accExistCondition
                ] }
            });
            return query.map(loanRow => new LoanDTO(loanRow));
        } catch(e) {
            throw e;
        };
    }
}

module.exports = { UserReturnSearch }