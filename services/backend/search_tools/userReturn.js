const { Op, where } = require("sequelize")
const LoanDTO = require("../dtos/loan.dto")
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, UsrDelete } = require("../models");
const logger = require("../logging");
const { successfulEventCondition, pendingOrCancelledEventCondition } = require("../controllers/utils");

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

        this.userCondition = this.userId
            ? { id : this.userId } : this.userName ? 
            { userName: { [Op.iLike]: `%${this.userName}%` } } : []
    }

    async run() {
        try {
            let query = await Loan.findAll({
                attributes: ['id'],
                include: [
                    {
                        model: Usr,
                        where: this.userCondition,
                        include: {
                            model: UsrDelete,
                            include: {
                                model: Event,
                                attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate'],
                                where: successfulEventCondition()
                            },
                            required: false
                        },
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
                            }
                        ],
                        where: this.accExistCondition,
                        required: false
                    },
                    {
                        model: AstLoan,
                        attributes: ['id', 'returnEventId'],
                        include: [
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
                            },
                            {
                                model: AstReturn,
                                include: {
                                    model: Event,
                                    attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate'],
                                    where: pendingOrCancelledEventCondition()
                                },
                                required: false
                            },
                        ],
                        required: false,
                    },
                ],
                where: {
                    [Op.or]: [
                        Sequelize.literal(`EXISTS (
                            SELECT 1 FROM "ast_loans" AS "AstLoan"                                       
                            WHERE "AstLoan"."loan_id" = "Loans"."id"
                            AND NOT EXISTS ( -- Get all returned astloan IDs
                                SELECT 1
                                FROM "ast_returns" AS "AstReturns"
                                JOIN "events" AS "AstReturns->Event" 
                                    ON "AstReturns"."event_id" = "AstReturns->Event"."id" 
                                    AND "AstReturns->Event"."cancelled" = FALSE
                                    AND "AstReturns->Event"."closed_date" IS NOT NULL 
                                WHERE "AstReturns"."ast_loan_id" = "AstLoan"."id"
                                GROUP BY "AstReturns"."ast_loan_id"
                            )
                        )`),
                        Sequelize.literal(`EXISTS (
                            SELECT 1 FROM "acc_loans" AS "AccLoans"."id" 
                            WHERE "acc_loans"."loan_id"  = "Loans"."id"
                            AND NOT EXISTS ( -- Get all returned accloan IDs
                                SELECT 1 
                                FROM "acc_returns" AS "AccReturns"
                                JOIN "events" AS "AccReturns->Event" 
                                    ON "AccReturns->Event"."id" = "AccReturns"."event_id"
                                    AND "AccReturns->Event"."cancelled" = FALSE
                                    AND "AccReturns->Event"."closed_date" IS NOT NULL
                                WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
                                GROUP BY "AccReturns"."acc_loan_id"
                                HAVING COALESCE(SUM("AccReturns"."count"), 0) = "AccLoans"."count"
                            )
                        )`),
                    ]
                },
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