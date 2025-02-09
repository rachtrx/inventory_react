const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, Event } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./loanSearch");

class AssetDelete {

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
                attributes: ['id', 'serialNumber', 'assetTag',
                    [
                        Sequelize.literal(`
                            GREATEST(
                                COALESCE("AddEvent"."event_date", '1970-01-01'),
                                COALESCE("AstLoans->Loan->ReserveEvent"."event_date", '1970-01-01'),
                                COALESCE("AstLoans->Loan->LoanEvent"."event_date", '1970-01-01'),
                                COALESCE("AstLoans->ReturnEvent"."event_date", '1970-01-01')
                            )
                        `),
                        "lastEventDate" // TODO is this causing error with raw = true?
                    ]
                ],
                where: { [Op.and] : [
                    this.assetCondition
                ]},
                include: [
                    {
                        model: Event,
                        as: "AddEvent",
                        attributes: ['eventDate']
                    },
                    {
                        model: AstLoan,
                        attributes: ['id', 'returnEventId'],
                        required: false,
                        include: [
                            {
                                model: Event,
                                as: "ReturnEvent",
                                attributes: ['eventDate']
                            },
                            {
                                model: Loan,
                                attributes: ['id', 'loanEventId', 'reserveEventId', 'cancelEventId'],
                                include: [
                                    {
                                        model: Event,
                                        as: "LoanEvent",
                                        attributes: ['eventDate'],
                                    },
                                    {
                                        model: Event,
                                        as: "ReserveEvent",
                                        attributes: ['eventDate'],
                                    },
                                    {
                                        model: Usr,
                                        attributes: ['id', 'userName'],
                                        include: {
                                            model: Dept,
                                            attributes: ['id', 'deptName'],
                                            where: {},
                                        }
                                        // where: Sequelize.literal(`
                                        //     EXISTS (
                                        //         SELECT 1
                                        //         FROM "usr_loans" AS "UsrLoans"
                                        //         INNER JOIN "usrs" AS "UsrLoans->Usr"
                                        //         ON "UsrLoans"."user_id" = "UsrLoans->Usr"."id"
                                        //         WHERE "UsrLoans"."loan_id" = "AstLoans->Loan"."id"
                                        //     )
                                        // `),
                                        // required: true,
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
                            }
                        ],
                        where: { // get (asset on loan or asset reserved) and not returned to disable them
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
                order: Sequelize.literal(`"AddEvent"."event_date" DESC`),
                raw: true // IMPT dont convert to sequelize model instances, otherwise cant retrive lastEventData
            })
            console.log(query.map(astRow => astRow.lastEventDate));
            return query.map(astRow => new AssetDTO(astRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AssetDelete }