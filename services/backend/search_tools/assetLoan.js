const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./allReturn");

class AssetLoan {

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
                attributes: ['id', 'serialNumber', 'assetTag', 'delEventId'],
                where: this.assetCondition,
                include: [
                    {
                        model: AstLoan,
                        attributes: ['id', 'returnEventId'],
                        include: {
                            model: Loan,
                            include: [
                                {
                                    model: Usr,
                                    attributes: ['id', 'userName'],
                                    where: [],
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
                        where: { // get (asset on loan or asset reserved) and not returned so we can disable them later
                            [Op.and]: [
                                Sequelize.literal(`"AstLoans"."return_event_id" IS NULL`) ,
                                Sequelize.literal(`
                                    "AstLoans"."loan_id" IN (
                                        SELECT "Loans"."id" 
                                        FROM "loans" AS "Loans" 
                                        WHERE "Loans"."loan_event_id" IS NOT NULL
                                        OR "Loans"."reserve_event_id" IS NOT NULL
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
                order: Sequelize.literal(`
                    CASE 
                        WHEN "AstLoans->Loan"."loan_event_id" IS NULL AND "AstLoans->Loan"."reserve_event_id" IS NULL THEN 1
                        WHEN "AstLoans->Loan"."loan_event_id" IS NULL THEN 2
                        WHEN "Ast"."del_event_id" IS NOT NULL THEN 4
                        ELSE 3
                    END ASC
                `)
            })
            return query.map(astRow => new AssetDTO(astRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AssetLoan }