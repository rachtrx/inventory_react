const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, AstReturn } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./loanSearch");
const { assetDeletedQuery, accessoryReturnedQuery, assetReturnedQuery, pendingOrCancelledEventCondition } = require("../controllers/utils");

class AssetReturn {

    constructor({
        serialNumbers = "",
        subTypeId = null,
        typeId = null,
    }) {
        this.serialNumbers = serialNumbers
        this.subTypeId = subTypeId
        this.typeId = typeId

        const isBulkSearch = Array.isArray(serialNumbers) 
        logger.info(serialNumbers)

        this.assetCondition = isBulkSearch
            ? { serialNumber: { [Op.in]: serialNumbers } }
            : { serialNumber: { [Op.iLike]: `%${serialNumbers}%` } };

        this.isBulkSearch = isBulkSearch
    }

    async run() {
        try {
            const query = await Ast.findAll({
                attributes: ['id', 'serialNumber', 'assetTag'],
                where: this.assetCondition,
                include: [
                    {
                        model: AstDelete,
                        include: {
                            model: Event,
                            attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate'],
                        },
                        required: false
                    },
                    {
                        model: AstLoan,
                        attributes: ['id'],
                        include: [
                            {
                                model: AstReturn,
                                include: {
                                    model: Event,
                                    attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate'],
                                    where: pendingOrCancelledEventCondition()
                                },
                                required: false
                            },
                            {
                                model: Loan,
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Event,
                                        attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate'],
                                    }, 
                                    {
                                        model: Usr,
                                        attributes: ['id', 'userName'],
                                        include: {
                                            model: Dept,
                                            attributes: ['id', 'deptName'],
                                            where: {},
                                        },
                                    },
                                    {
                                        model: AccLoan,
                                        attributes: ['id', 'count'],
                                        include: [
                                            accessoryReturnedQuery,
                                            {
                                                model: AccType,
                                                attributes: ['id', 'accessoryName'],
                                            }
                                        ],
                                        where: Sequelize.literal(`
                                            EXISTS (
                                                SELECT 1
                                                FROM acc_returns" AS "AccReturns"
                                                WHERE "AccReturns"."acc_loan_id" = "AstLoans->Loan->AccLoans"."id" -- reference to outer query
                                                AND "AstLoans->Loan->AccLoans"."count" > (
                                                    SELECT COALESCE(SUM("AccReturns"."count"), 0)
                                                    FROM "acc_returns" AS "AccReturns"
                                                    JOIN "events" AS "AccReturns->Event" ON "AccReturns->Event"."id" = "AccReturns"."event_id"
                                                    WHERE "AccReturns"."acc_loan_id" = "AstLoans->Loan->AccLoans"."id"
                                                    AND "AccReturns->Event"."cancelled" = FALSE
                                                    AND "AccReturns->Event"."closed_date" IS NOT NULL
                                                )
                                            )
                                        `),
                                        required: false
                                    }
                                ]
                            }
                        ],
                        required: false,
                        where: Sequelize.literal(`
                            "AstLoans"."loan_id" IN (
                                SELECT "Loans"."id" 
                                FROM "loans" AS "Loans"
                                JOIN "ast_loans" AS "AstLoan" ON "AstLoan"."loan_id" = "Loans"."id"                                        
                                JOIN "acc_loans" AS "AccLoans" ON "AccLoans"."loan_id" = "Loans"."id"

                                WHERE NOT EXISTS ( -- Get all returned astloan IDs
                                    SELECT 1
                                    FROM "ast_returns" AS "AstReturns"
                                    JOIN "events" AS "AstReturns->Event" 
                                        ON "AstReturns"."event_id" = "AstReturns->Event"."id" 
                                        AND "AstReturns->Event"."closed_date" IS NOT NULL 
                                        AND "AstReturns->Event"."cancelled" = FALSE
                                    WHERE "AstReturns"."ast_loan_id" = "AstLoan"."id"
                                    GROUP BY "AstReturns"."ast_loan_id"
                                ) 

                                OR NOT EXISTS ( -- Get all returned accloan IDs
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
                            );
                        `),
                    },
                    {
                        model: AstSType,
                        attributes: ['subTypeName'],
                        ...(this.subTypeId && { where: { id: this.subTypeId } }),
                        include: {
                            model: AstType,
                            attributes: ['typeName'],
                            ...(this.typeId && { where: { id: this.typeId } })
                        }
                    }
                ],
                order: !this.isBulkSearch ? Sequelize.literal(`
                    "AstLoans->AstReturns->Event"."id" IS NULL 
                    AND "AstLoans->Event"."closed_date" IS NOT NULL 
                    AND "AstLoans->Event"."cancelled" = FALSE DESC, -- not returned and on loan (ignoring reservations)

                    CASE 
                        WHEN "AstLoans->Loan->AccLoans"."count" > (
                            SELECT COALESCE(SUM("AccReturns"."count"), 0)
                            FROM "acc_returns" AS "AccReturns"
                            JOIN "events" AS "AccReturns->Event" ON "AccReturns->Event"."id" = "AccReturns"."event_id"
                            WHERE "AccReturns"."acc_loan_id" = "AstLoans->Loan->AccLoans"."id"
                            AND "AccReturns->Event"."cancelled" = FALSE
                            AND "AccReturns->Event"."closed_date" IS NOT NULL
                        ) THEN 2
                        WHEN "AstDeletes->Event"."closed_date" IS NOT NULL AND "AstDeletes->Event"."cancelled" = FALSE THEN 0
                        ELSE 1
                    END DESC
                `) : []
            })
            return query.map(astRow => new AssetDTO(astRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AssetReturn }