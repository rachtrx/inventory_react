exports.getUnreturnedAstLoanIds = () => {
    return `
            SELECT "AstLoan"."loan_id" 
            FROM "ast_loans" AS "AstLoan"
            JOIN "loans" AS "AstLoan->Loan" 
                ON "AstLoan"."loan_id" = "AstLoan->Loan"."id"
            JOIN "events" AS "AstLoan->Loan->Event" 
                ON "AstLoan->Loan"."event_id" = "AstLoan->Loan->Event"."id"
            LEFT JOIN "ast_returns" AS "AstLoan->AstReturns" 
                ON "AstLoan"."id" = "AstLoan->AstReturns"."ast_loan_id"
            LEFT JOIN "events" AS "AstLoan->AstReturns->Event" 
                ON "AstLoan->AstReturns->Event"."id" = "AstLoan->AstReturns"."event_id"
            WHERE 
                -- Condition to ensure AstLoan is NOT cancelled
                "AstLoan->Loan->Event"."cancelled" = FALSE
                
                -- Ensure there is NO AstReturn that is NOT cancelled AND has a closed_date NOT NULL
                AND NOT EXISTS (
                    SELECT 1 FROM "ast_returns" AS "InnerReturns"
                    JOIN "events" AS "InnerReturns->Event" 
                        ON "InnerReturns->Event"."id" = "InnerReturns"."event_id"
                    WHERE 
                        "InnerReturns"."ast_loan_id" = "AstLoan"."id"
                        AND "InnerReturns->Event"."cancelled" = FALSE
                        AND "InnerReturns->Event"."closed_date" IS NOT NULL
                )
    `
}

exports.getUnreturnedAccLoanIds = () => {
    return `
            SELECT "AccLoan"."loan_id" 
            FROM "acc_loans" AS "AccLoan"
            JOIN "loans" AS "AccLoan->Loan" 
                ON "AccLoan"."loan_id" = "AccLoan->Loan"."id"
            JOIN "events" AS "AccLoan->Loan->Event" 
                ON "AccLoan->Loan"."event_id" = "AccLoan->Loan->Event"."id"
            LEFT JOIN "acc_returns" AS "AccLoan->AccReturns" 
                ON "AccLoan"."id" = "AccLoan->AccReturns"."acc_loan_id"
            LEFT JOIN "events" AS "AccLoan->AccReturns->Event" 
                ON "AccLoan->AccReturns->Event"."id" = "AccLoan->AccReturns"."event_id"
            WHERE 
                -- Condition to ensure AccLoan is NOT cancelled
                "AccLoan->Loan->Event"."cancelled" = FALSE
                
                -- Ensure there is NO AccReturn that is NOT cancelled AND has a closed_date NOT NULL
                AND "AccLoans"."count" > (
                    SELECT COALESCE(SUM("AccReturns"."count"), 0)
                    FROM "acc_returns" AS "AccReturns"
                    JOIN "events" AS "AccReturns->Event" ON "AccReturns->Event"."id" = "AccReturns"."event_id"
                    WHERE "AccLoans->AccReturns"."acc_loan_id" = "AccLoan"."id"
                    AND "AccReturns->Event"."cancelled" = FALSE
                    AND "AccReturns->Event"."closed_date" IS NOT NULL
                )
    `
}