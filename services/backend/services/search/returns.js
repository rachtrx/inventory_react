const { Op, where } = require("sequelize")
const LoanDTO = require("@dtos/loan.dto")
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, Event } = require("@models");
const logger = require("@/utils/logging");

class ReturnSearch {

    constructor({
        loanIds = [],
    }) {
        logger.info(loanIds)
        this.loanIds = loanIds;
    }

    async run() {
        try {
            let query = await Loan.findAll({
                where: { id: { [Op.in]: this.loanIds } },
                include: [
                    {
                        model: Event,
                        as: 'LoanEvent',
                        required: true
                    },
                    {
                        model: Usr,
                        attributes: ['id', 'userName'],
                        include: {
                            model: Dept,
                            attributes: ['id', 'deptName'],
                        },
                        required: true,
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
            });
            return query.map(usrRow => new LoanDTO(usrRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { ReturnSearch }

// where: { [Op.and]: [
//     Sequelize.literal(`
//         NOT EXISTS (
//             SELECT 1
//             FROM "acc_returns" AS "AccReturns"
//             WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
//             GROUP BY "AccLoans"."id"
//             HAVING COALESCE(SUM("AccReturns"."count"), 0) = "AccLoans"."count"
//         )
//     `),
//     Sequelize.literal(`
//         NOT EXISTS (
//             SELECT 1 FROM "ast_loans" AS "AstLoans"
//             WHERE "AstLoans"."id" = "AstLoan"."id"
//             AND "AstLoans"."return_event_id" IS NOT NULL
//         )
//     `)
// ]},
// order: [
//     Sequelize.literal(`
//         "LoanEvent"."event_date" DESC
//     `),
//     Sequelize.literal(`
//         "AstLoans"."id" IS NULL DESC
//     `)
// ]