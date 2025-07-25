const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, Event } = require("@models");
const AssetDTO = require("@dtos/ast.dto");
const logger = require("@utils/logging");

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
                attributes: ['id', 'serialNumber', 'alias',
                    [
                        Sequelize.literal(`
                            GREATEST(
                                COALESCE("AddEvent"."event_date", '1970-01-01'),
                                COALESCE("AstLoans->Loan"."expected_loan_date", '1970-01-01'),
                                COALESCE("AstLoans->Loan"."expected_return_date", '1970-01-01'),
                                COALESCE("AstLoans->Loan->ReserveEvent"."event_date", '1970-01-01'),
                                COALESCE("AstLoans->Loan->LoanEvent"."event_date", '1970-01-01'),
                                COALESCE("AstLoans->ReturnEvent"."event_date", '1970-01-01')
                            )
                        `),
                        "lastEventDate"
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
                        required: false,
                        include: [
                            {
                                model: Event,
                                as: "ReturnEvent",
                                attributes: ['eventDate'],
                                required: false
                            },
                            {
                                model: Loan,
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
                                        }
                                    }
                                ]
                            }
                        ],
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
                    },
                ],
                order: [
                    [Sequelize.literal('CASE WHEN "Ast"."del_event_id" IS NULL THEN 1 ELSE 0 END ASC')],
                    [Sequelize.literal(`CASE 
                        WHEN "AstLoans"."return_event_id" IS NULL AND "AstLoans->Loan"."loan_event_id" IS NOT NULL THEN 2
                        WHEN "AstLoans->Loan"."loan_event_id" IS NULL AND "AstLoans->Loan"."reserve_event_id" IS NOT NULL THEN 1 
                        ELSE 0 
                    END ASC`)],
                ]
            })
            return query.map(astRow => new AssetDTO(astRow.dataValues).setOngoingLoan().setOngoingReservation());
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AssetDelete }