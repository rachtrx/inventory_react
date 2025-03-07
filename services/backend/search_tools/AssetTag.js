const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, Event, AstTagMap, AstTag, AstTagMapDel } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { pendingOrCancelledEventCondition } = require("../controllers/utils");

class AssetTagSearch {

    constructor({
        tagId = null,
        serialNumbers = [],
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
        this.tagId = tagId;

        this.includeArray = [
            {
                model: Event,
                as: 'DelEvent',
                attributes: ['eventDate']
            },
            {
                model: AstSType,
                attributes: ['subTypeName'],
                ...(subTypeId && { where: { id: subTypeId } }),
                include: {
                    model: AstType,
                    attributes: ['typeName'],
                    ...(typeId && { where: { id: typeId } })
                }
            },
            {
                model: AstTagMap,
                attributes: ['id', [
                    Sequelize.literal(`
                        CASE
                            WHEN "AstTagMaps"."tag_id" = '${this.tagId}' THEN true
                            ELSE false
                        END
                    `),
                    'isMatching'
                ]],
                include: [ // get all current tags
                    {
                        model: AstTagMapDel,
                        include: {
                            model: Event,
                            where: pendingOrCancelledEventCondition(),
                            required: true
                        },
                        required: false
                    },
                    {
                        model: AstTag,
                        attributes: ['id', 'tagName']
                    },
                ],
                required: false
            }
        ];
    }

    async run(isAdd) {

        const orderByArr = []

        if (this.tagId) {
            orderByArr.push([
                Sequelize.literal(`(
                    SELECT COUNT(*) 
                    FROM ast_tag_maps AS "AstTagMaps" 
                    WHERE "AstTagMaps"."asset_id" = "Ast"."id" 
                    AND "AstTagMaps->AstTagMapDels->Event"."cancelled" IS NULL
                    AND "AstTagMaps"."tag_id" = '${this.tagId}'
                )`), 
                isAdd ? 'ASC' : 'DESC'
            ]);
        }
        
        // Always apply the delete event order
        orderByArr.push([
            Sequelize.literal('CASE WHEN "AstTagMaps->AstTagMapDels->Event"."cancelled" IS NULL THEN 1 ELSE 0 END'),
            'DESC'
        ]);

        try {
            const query = await Ast.findAll({
                attributes: ['id', 'serialNumber', 'assetTag'],
                where: this.assetCondition,
                include: this.includeArray,
                order: orderByArr
            })
            return query.map(astRow => new AssetDTO(astRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { AssetTagSearch }
