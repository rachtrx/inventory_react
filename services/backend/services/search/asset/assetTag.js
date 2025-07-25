const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, Event, AstTagMap, AstTag } = require("@models");
const AssetDTO = require("@dtos/ast.dto");
const logger = require("@/utils/logging");

class AssetTagSearch {

    constructor({
        tagId = null,
        serialNumbers = [],
        isAdd,
        subTypeId = null,
        typeId = null,
    }) {
        this.serialNumbers = serialNumbers;

        const isBulkSearch = Array.isArray(serialNumbers) 
        logger.info(serialNumbers)

        this.assetCondition = isBulkSearch
            ? { serialNumber: { [Op.in]: serialNumbers } }
            : { serialNumber: { [Op.iLike]: `%${serialNumbers}%` } };
            
        this.isBulkSearch = isBulkSearch;
        
        if (tagId) {
            this.attributes = ['id', [
                Sequelize.literal(`
                    CASE
                        WHEN "AstTagMaps"."tag_id" = '${this.tagId}' THEN true
                        ELSE false
                    END
                `),
                'isMatching'
            ]]
        } else this.attributes = ['id']

        if (this.tagId) {
            this.orderByArr = [[
                Sequelize.literal(`EXISTS (
                    SELECT 1
                    FROM ast_tag_maps AS "AstTagMaps" 
                    WHERE "AstTagMaps"."asset_id" = "Ast"."id" 
                    AND "AstTagMaps"."del_event_id" IS NULL 
                    AND "AstTagMaps"."tag_id" = '${this.tagId}'
                )`), 
                isAdd ? 'ASC' : 'DESC'
                ]];
        } else this.orderByArr = []
        
        // Always apply the delete event order
        this.orderByArr.push([
            Sequelize.literal('CASE WHEN "Ast"."del_event_id" IS NOT NULL THEN 0 ELSE 1 END'),
            'DESC'
        ]);
    }

    async run() {
        try {
            const query = await Ast.findAll({
                attributes: ['id', 'serialNumber', 'alias'],
                where: this.assetCondition,
                include: [
                    {
                        model: Event,
                        as: 'DeleteEvent',
                        attributes: ['eventDate']
                    },
                    {
                        model: AstSType,
                        attributes: ['subTypeName'],
                        // ...(subTypeId && { where: { id: subTypeId } }),
                        include: {
                            model: AstType,
                            attributes: ['typeName'],
                            // ...(typeId && { where: { id: typeId } })
                        }
                    },
                    {
                        model: AstTagMap,
                        attributes: this.attributes,
                        where: { delEventId: { [Op.eq]: null } }, // get all current tags
                        include: {
                            model: AstTag,
                            attributes: ['id', 'tagName']
                        },
                        required: false
                    }
                ],
                order: this.orderByArr
            })
            return query.map(astRow => new AssetDTO(astRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AssetTagSearch }
