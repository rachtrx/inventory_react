const { Op } = require("sequelize");
const { Usr, Dept, Sequelize, Event, UsrTagMap, UsrTag } = require("../models");
const logger = require("../logging");
const UserDTO = require("../dtos/usr.dto");

class UserTagSearch {

    constructor({
        tagId = null,
        userNames = [],
        deptId = null,
    }) {
        this.userNames = userNames;

        const isBulkSearch = Array.isArray(userNames) 
        logger.info(userNames)

        this.userCondition = isBulkSearch
            ? { userName: { [Op.in]: userNames } }
            : { userName: { [Op.iLike]: `%${userNames}%` } };
            
        this.isBulkSearch = isBulkSearch;
        this.tagId = tagId;

        this.includeArray = [
            {
                model: Event,
                as: 'DeleteEvent',
                attributes: ['eventDate']
            },
            {
                model: Dept,
                attributes: ['deptName'],
                ...(deptId && { where: { id: deptId } }),
            },
            {
                model: UsrTagMap,
                attributes: ['id', [
                    Sequelize.literal(`
                        CASE
                            WHEN "UsrTagMaps"."tag_id" = '${this.tagId}' THEN true
                            ELSE false
                        END
                    `),
                    'isMatching'
                ]],
                where: { delEventId: { [Op.eq]: null } }, // get all current tags
                include: {
                    model: UsrTag,
                    attributes: ['id', 'tagName']
                },
                required: false
            }
        ];
    }

    async run(isAdd) {

        const orderByArr = []

        if (this.tagId) {
            orderByArr.push([
                Sequelize.literal(`EXISTS (
                    SELECT 1
                    FROM usr_tag_maps AS "UsrTagMaps" 
                    WHERE "UsrTagMaps"."user_id" = "Usr"."id" 
                    AND "UsrTagMaps"."del_event_id" IS NULL 
                    AND "UsrTagMaps"."tag_id" = '${this.tagId}'
                )`), 
                isAdd ? 'ASC' : 'DESC'
            ]);
        }
        
        // Always apply the delete event order
        orderByArr.push([
            Sequelize.literal('CASE WHEN "Usr"."del_event_id" IS NOT NULL THEN 0 ELSE 1 END'),
            'DESC'
        ]);

        try {
            const query = await Usr.findAll({
                attributes: ['id', 'userName'],
                where: this.userCondition,
                include: this.includeArray,
                order: orderByArr
            })
            // query.forEach(usrRow => console.log(usrRow));
            return query.map(usrRow => new UserDTO(usrRow.dataValues));
        } catch (e) {
            
            throw e;
        }
    }
}

module.exports = { UserTagSearch }
