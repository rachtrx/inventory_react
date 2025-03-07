const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, Event, AstDelete, AstReturn } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./loanSearch");
const { assetDeletedQuery, accessoryReturnedQuery } = require("../controllers/utils");

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
                                COALESCE("AstLoans->Loan->Event"."opened_date", '1970-01-01'),
                                MIN(
                                    COALESCE("AstLoans->Loan->Event"."closed_date", '1970-01-01'),
                                    COALESCE("AstLoans->Loan->Event"."expected_close_date", '1970-01-01'),
                                )
                                COALESCE("AstLoans->AstReturns->Event"."opened_date", '1970-01-01'),
                                MIN(
                                    COALESCE("AstLoans->AstReturns->Event"."closed_date", '1970-01-01'),
                                    COALESCE("AstLoans->AstReturns->Event"."expected_close_date", '1970-01-01'),
                                )
                            )
                        `),
                        "lastEventDate" // TODO is this causing error with raw = true?
                    ]
                ],
                where: { [Op.and] : [
                    this.assetCondition
                ]},
                include: [
                    assetDeletedQuery,
                    {
                        model: Event,
                        attributes: ['closedDate'],
                        where: { cancelled: { [Op.ne]: true} }
                    },
                    {
                        model: AstLoan,
                        attributes: ['id'],
                        required: false,
                        include: [
                            {
                                model: AstReturn,
                                include: {
                                    model: Event,
                                    attributes: ['openedDate', 'closedDate', 'expectedCloseDate', 'cancelled'],
                                }
                            },
                            {
                                model: Loan,
                                attributes: ['id'],
                                include: [
                                    {
                                        model: Event,
                                        attributes: ['openedDate', 'closedDate', 'expectedCloseDate', 'cancelled'],
                                    },
                                    {
                                        model: Usr,
                                        attributes: ['id', 'userName'],
                                        include: {
                                            model: Dept,
                                            attributes: ['id', 'deptName'],
                                            where: {},
                                        }
                                    }
                                ]
                            }
                        ],
                        // get (asset on loan or asset reserved) and not returned to disable them
                        where: Sequelize.literal(`"AstLoans"."loan_id" IN (${getUnreturnedAstLoanIds()})`)
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