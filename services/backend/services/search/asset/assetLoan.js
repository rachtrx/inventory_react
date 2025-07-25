const { Op } = require("sequelize");
const { Loan, AstLoan, Ast, Usr, Dept, Sequelize, AstSType, AstType } = require("@models");
const AssetDTO = require("@dtos/ast.dto");
const logger = require("@/utils/logging");

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
                attributes: ['id', 'serialNumber', 'alias', 'delEventId', 'subTypeId'],
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
                                },
                            ]
                        },
                        required: false,
                        where: {
                            returnEventId: {
                                [Op.eq]: null
                            }
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
                        WHEN "Ast"."del_event_id" IS NOT NULL THEN 1 -- deleted
                        WHEN "AstLoans"."return_event_id" IS NULL AND "AstLoans->Loan"."loan_event_id" IS NOT NULL THEN 2 -- on loan
                        WHEN "AstLoans->Loan"."loan_event_id" IS NULL AND "AstLoans->Loan"."id" IS NOT NULL THEN 3 -- reserved
                        ELSE 4
                    END DESC
                `)
            })
            return query.map(astRow => new AssetDTO(astRow).setOngoingLoan().setOngoingReservation());
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AssetLoan }