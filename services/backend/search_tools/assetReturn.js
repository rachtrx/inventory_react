const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./loanSearch");

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
                where: { [Op.and] : [
                    this.assetCondition,
                    { delEventId: null}
                ]},
                include: [
                    {
                        model: AstLoan,
                        attributes: ['id', 'returnEventId'],
                        include: {
                            model: Loan,
                            attributes: ['id', 'expectedReturnDate', 'loanEventId', 'reserveEventId', 'cancelEventId'],
                            include: [
                                {
                                    model: Usr,
                                    attributes: ['id', 'userName'],
                                    include: {
                                        model: Dept,
                                        attributes: ['id', 'deptName'],
                                        where: {},
                                    },
                                    // where: Sequelize.literal(`
                                    //     EXISTS (
                                    //         SELECT 1
                                    //         FROM "usr_loans" AS "UsrLoans"
                                    //         INNER JOIN "usrs" AS "UsrLoans->Usr"
                                    //         ON "UsrLoans"."user_id" = "UsrLoans->Usr"."id"
                                    //         WHERE "UsrLoans"."loan_id" = "AstLoans->Loan"."id"
                                    //     )
                                    // `),
                                    // required: true
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
                                    where: Sequelize.literal(`
                                        EXISTS (
                                            SELECT 1
                                            FROM "acc_loans" AS "AccLoans"
                                            INNER JOIN "acc_types" AS "AccLoans->AccType"
                                            ON "AccLoans"."accessory_type_id" = "AccLoans->AccType"."id"
                                            WHERE "AccLoans"."loan_id" = "AstLoans->Loan"."id"
                                            AND "AccLoans"."count" > (
                                                SELECT COALESCE(SUM("AccLoans->AccReturns"."count"), 0)
                                                FROM "acc_returns" AS "AccLoans->AccReturns"
                                                WHERE "AccLoans->AccReturns"."acc_loan_id" = "AccLoans"."id"
                                            )
                                        )
                                    `),
                                    required: false
                                }
                            ]
                        },
                        required: false,
                        where: { // more flexible when seaching for returns, include those where asset is returned but accessories arent returned
                            [Op.or]: [
                                // the assetloan is unreturned OR
                                Sequelize.literal(`"AstLoans"."return_event_id" IS NULL`),
                                // the assetLoan has other unreturned accessories
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
                    "AstLoans"."return_event_id" IS NULL AND "AstLoans->Loan"."loan_event_id" IS NOT NULL DESC, -- not returned and on loan (ignoring reservations)
                    CASE 
                        WHEN "AstLoans->Loan->AccLoans"."count" > (
                            SELECT COALESCE(SUM("AstLoans->Loan->AccLoans->AccReturns"."count"), 0)
                            FROM "acc_returns" AS "AstLoans->Loan->AccLoans->AccReturns"
                            WHERE "AstLoans->Loan->AccLoans->AccReturns"."acc_loan_id" = "AstLoans->Loan->AccLoans"."id"
                        ) THEN 2
                        WHEN "Ast"."del_event_id" IS NOT NULL THEN 0
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