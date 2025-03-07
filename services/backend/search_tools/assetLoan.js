const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, AstDelete } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./loanSearch");
const { getUnreturnedAccLoanIds, getUnreturnedAstLoanIds } = require("./utils");
const { assetDeletedQuery } = require("../controllers/utils");

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
                    assetDeletedQuery,
                    {
                        model: AstLoan,
                        attributes: ['id'],
                        include: {
                            model: Loan,
                            attributes: ['id'],
                            include: [
                                {
                                    model: Event,
                                    attributes: ['openedDate', 'closedDate', 'cancelled'],
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
                                // {
                                //     model: AccLoan,
                                //     attributes: ['id', 'count'],
                                //     include: [
                                //         {
                                //             model: AccReturn,
                                //             attributes: ['id', 'count']
                                //         },
                                //         {
                                //             model: AccType,
                                //             attributes: ['id', 'accessoryName'],
                                //         }
                                //     ],
                                //     where: Sequelize.literal(`
                                //         "AstLoans->Loan->AccLoans"."loan_id" IN (${getUnreturnedAccLoanIds()})
                                //     `),
                                //     required: false
                                // }
                            ]
                        },
                        required: false,
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
                order: Sequelize.literal(`
                    CASE 
                        WHEN "AstLoans->Loan->Event"."opened_date" IS NULL AND "AstLoans->Loan"."closed_date" IS NULL THEN 1
                        WHEN "AstLoans->Loan"."closed_date" IS NULL THEN 2
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