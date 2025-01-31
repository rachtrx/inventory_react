const { Op } = require("sequelize");
const { Loan, Ast, AstSType, AstType, AstLoan, Sequelize } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { ReturnSearch } = require("./return");

class AssetReturnSearch extends ReturnSearch {

    constructor({
        serialNumbers = "",
        subTypeId = null,
        typeId = null,
    }) {
        super({
            loanModelAssociation: "AstLoans->Loan"
        });
        this.serialNumbers = serialNumbers
        this.subTypeId = subTypeId
        this.typeId = typeId

        const isBulkSearch = Array.isArray(serialNumbers) 
        logger.info(serialNumbers)

        this.assetCondition = isBulkSearch
            ? { serialNumber: { [Op.in]: serialNumbers } }
            : { serialNumber: { [Op.iLike]: `%${serialNumbers}%` } };

        this.assetLoanCondition = { where: 
            {
                [Op.or]: [
                    Sequelize.literal(`"AstLoans"."return_event_id" IS NULL`),
                    Sequelize.literal(`
                        "AstLoans"."loan_id" IN (
                            SELECT "Loans"."id" 
                            FROM "loans" AS "Loans" 
                            JOIN "acc_loans" AS "AccLoans" ON "AccLoans"."loan_id" = "Loans"."id"
                            JOIN "acc_returns" AS "AccLoans->AccReturns" ON "AccLoans"."id" = "AccLoans->AccReturns"."acc_loan_id"
                            WHERE "AccLoans"."count" > (
                                SELECT COALESCE(SUM("AccLoans->AccReturns"."count"), 0)
                                FROM "acc_returns" AS "AccLoans->AccReturns"
                                WHERE "AccLoans->AccReturns"."acc_loan_id" = "AccLoans"."id"
                            )
                        )
                    `),
                ]
            }
        };
        
        if (!isBulkSearch) {
            this.orderBy = Sequelize.literal(`
                "AstLoans"."return_event_id" IS NULL AND "AstLoans->Loan"."loan_event_id" IS NOT NULL DESC,
                CASE 
                    WHEN "AstLoans->Loan->AccLoans"."count" > (
                        SELECT COALESCE(SUM("AstLoans->Loan->AccLoans->AccReturns"."count"), 0)
                        FROM "acc_returns" AS "AstLoans->Loan->AccLoans->AccReturns"
                        WHERE "AstLoans->Loan->AccLoans->AccReturns"."acc_loan_id" = "AstLoans->Loan->AccLoans"."id"
                    ) THEN 1
                    ELSE 0
                END DESC
            `);
        }
    }

    async run() {
        try {
            const query = await Ast.findAll({
                attributes: this.assetAttributes,
                where: this.assetCondition,
                include: [
                    {
                        model: AstLoan,
                        attributes: ['id', 'returnEventId'],
                        include: {
                            model: Loan,
                            ...(this.loanQuery)
                        },
                        required: false,
                        ...(this.assetLoanCondition)
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
                order: [
                    ...(this.orderBy ? [[this.orderBy]] : [])
                ]
            })
            return query.map(astRow => new AssetDTO(astRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AssetReturnSearch };