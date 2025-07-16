const { Ast, AstType, AstSType, Vendor, Usr, AstLoan, Sequelize, sequelize, Event, AccType, AccLoan, AccReturn, Loan, Admin, Rmk, AstTagMap, AstTag } = require('../models/index.js');
const { Op } = require('sequelize');
const { createSelection, getAllOptions, getDistinctOptions, getAssetFilters, getSubTypes, assetFilters, getSortCondition, generateExcel } = require('./utils.js');
const logger = require('../logging.js');
const AssetDTO = require('../dtos/ast.dto.js');
const EventDTO = require('../dtos/event.dto.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');

const dateTimeObject = {
    weekday: 'short',
    hour: 'numeric' || '',
    minute: 'numeric' || '',
    day: 'numeric',
    month: 'short',
    year: '2-digit'
}

class AssetController {

    async getSubTypeFilters(req, res) {
        const { typeIds } = req.body;

        try {
            const result = await getSubTypes(typeIds);
            return res.json(result);
        } catch (error) {
            console.error("Error fetching options:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async getAllFilters(req, res) {
        try {
            const optionsDict = Object.fromEntries(
                await Promise.all(
                    assetFilters.map(async (field) => [field, await getAssetFilters(field)])
                )
            );
            return res.json(optionsDict)
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async getFilters(req, res) {
        const { field } = req.body;
        try {
            const options = await getAssetFilters(field);
            return res.json(options || [])
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    getAllAssetsEndpoint = async (req, res, next) => {
        try {
            const { filters, page = 1, limit = 30, sort } = req.query;
            const query = await this.getAssets(filters, sort);

            const count = query.length;
            const rows = query.slice((page - 1) * limit, page * limit);
            
            let result = rows.map(assetRow => {
                const asset = new AssetDTO(assetRow).setOngoingLoan().setOngoingReservation().deleteLoans();
                return asset;
            });

            res.json({
                data: result,
                totalCount: count, // Total assets count
                totalPages: Math.max(Math.ceil(count / limit), 1), // Calculate total pages
                currentPage: Math.max(parseInt(page, 10), 1)
            });
        } catch (err) {
            logger.error(err)
            next(err);
        }
    }

    getAllAssetsExcelEndpoint = async (req, res, next) => {
        try {
            const { filters, sort } = req.query;

            const query = await this.getAssets(filters, sort);
            let result = query.map(assetRow => {
                const asset = new AssetDTO(assetRow).setOngoingLoan().setOngoingReservation().deleteLoans();
                asset.astLoans = undefined
                return asset;
            });

            const workbook = generateExcel(result, 'Asset Logs')

            // Prepare response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="event_logs.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            logger.error(err)
            next(err);
        }
    }
    
    getAssets = async (filters, sort) => {

        const assetsExist = await Ast.count();
        if (assetsExist === 0) return [];

        const sortFieldLookup = {
            typeName: '"AstSType->AstType"."type_name"',
            subTypeName: '"AstSType"."sub_type_name"',
            serialNumber: '"serial_number"',
        }
        
        let sortCondition;
        if (sort?.length === 2) sortCondition = getSortCondition(sortFieldLookup, sort);
        console.log(sortCondition);
    
        const whereClause = {
            [Op.and]: [
                ...(filters?.serialNumber ? [{ serialNumber: { [Op.iLike]: `%${filters.serialNumber}%` } }] : []),
                ...(filters?.location && filters.location.length > 0 ? [{ location: filters.location }] : []),
                ...(filters?.bookmarked === true ? [{ bookmarked: true }] : []),
                ...(filters?.age?.length === 2 ? [
                    Sequelize.literal(`
                        FLOOR(DATE_PART('day', NOW() - "AddEvent"."event_date") / 365.25) 
                        BETWEEN ${filters.age[0]} AND ${filters.age[1]}
                    `)
                ] : []),
                ...(!filters?.status?.includes('Condemned')
                    ? [Sequelize.literal(`NOT EXISTS (
                            SELECT 1
                            FROM "events"
                            WHERE "events"."id" = "DeleteEvent"."id"
                        )`)]
                    : []
                ),
                ...(!filters?.status?.includes('Available')
                    ? [Sequelize.literal(`NOT EXISTS (
                            SELECT 1
                            FROM "asts"
                            LEFT JOIN "ast_loans" ON "asts"."id" = "ast_loans"."asset_id"
                            WHERE "asts"."id" = "Ast"."id"
                            AND "asts"."del_event_id" IS NULL
                            AND (
                                "ast_loans"."id" IS NULL -- asset with no asset loans
                                OR "ast_loans"."return_event_id" IS NOT NULL -- asset with all returns
                            )
                        )`)]
                    : []
                ),
                ...(!filters?.status?.includes('On Loan')
                    ? [Sequelize.literal(`NOT EXISTS (
                            SELECT 1
                            FROM "ast_loans"
                            WHERE "ast_loans"."id" = "AstLoans"."id"
                            AND "ast_loans"."return_event_id" IS NULL
                        )`)]
                    : []
                ),
                ...(!filters?.status?.includes('Reserved')
                    ? [Sequelize.literal(`NOT EXISTS (
                            SELECT 1
                            FROM "loans"
                            WHERE "loans"."id" = "AstLoans->Loan"."id"
                            AND "loans"."reserve_event_id" IS NOT NULL
                            AND "loans"."loan_event_id" IS NULL
                        )`)]
                    : []
                )
            ]
        };
        // Use `findAndCountAll` for pagination
        const query = await Ast.findAll({
            attributes: ['id', 'serialNumber', 'alias', 'location', 'bookmarked', 'value'],
            include: [
                {
                    model: AstTagMap,
                    attributes: ['id'],
                    where: { delEventId: { [Op.eq]: null }}, 
                    include: {
                        model: AstTag,
                        attributes: ['id', 'tagName'],
                        ...(filters?.assetTag?.length && { where: { id: { [Op.in]: filters.assetTag } } }),
                    },
                    required: filters?.assetTag?.length ? true : false
                },
                {
                    model: AstSType,
                    required: true,
                    attributes: ['subTypeName'],
                    ...(filters?.subTypeName?.length && { where: { id: { [Op.in]: filters.subTypeName } } }),
                    include: {
                        model: AstType,
                        required: true,
                        attributes: ['typeName'],
                        ...(filters?.typeName?.length && { where: { id: { [Op.in]: filters.typeName } } }),
                    }
                },                    
                {
                    model: Event,
                    as: 'AddEvent',
                    attributes: ['eventDate'],
                    required: true
                },
                {
                    model: Event,
                    as: 'DeleteEvent',
                    attributes: ['eventDate'],
                    required: false,
                },
                {
                    model: Vendor,
                    attributes:['vendorName'],
                    ...(filters?.vendor?.length && { where: { id: { [Op.in]: filters.vendor } } }),
                },
                {
                    model: AstLoan,
                    attributes: ['id', 'returnEventId'],
                    include: {
                        model: Loan,
                        include: {
                            model: Usr,
                            attributes: ['id', 'userName', 'bookmarked'],
                        },
                    },
                    where: { returnEventId: null },
                    required: false
                }
            ],
            where: whereClause || {},
            order: sortCondition ? [sortCondition] : [], // Handle sorting dynamically
        });

        // logger.info(result.slice(0, 10));

        return query;
    }
    

    // if (filters.age.length > 0) {
    //     query = query.filter(asset => {
    //         const assetAge = Math.floor((new Date() - new Date(asset.AddEvent.eventDate)) / (365.25 * 24 * 60 * 60 * 1000));
    //         return filters.age.includes(String(assetAge));
    //     });
    // }
    
    getAsset = async (req, res) => {
        const assetId = req.params.id;
    
        try {
            const assetDetails = await Ast.findOne({
                attributes: [
                    'id',
                    'serialNumber',
                    'alias',
                    'location',
                    'value',
                    'bookmarked',
                    'delEventId'
                ],
                include: [
                    {
                        model: AstTagMap,
                        attributes: ['id'],
                        where: { delEventId: { [Op.eq]: null }}, 
                        include: {
                            model: AstTag,
                            attributes: ['id', 'tagName'],
                        },
                        required: false
                    },
                    {
                        model: AstSType,
                        attributes: ['subTypeName', 'id'],
                        include: {
                            model: AstType,
                            attributes: ['typeName', 'id']
                        }
                    },
                    {
                        model: Vendor,
                        attributes: ['vendorName']
                    }
                ],
                where: { id: assetId }
            });
            
            if (!assetDetails) return res.status(404).send({ error: "Ast not found" });
            
            const asset = new AssetDTO(assetDetails);

            asset.history = await this.getAllEvents(asset.assetId);

            if (asset.history && asset.history.length > 0) {

                asset.loanEventId = asset.history // TODO fixed loan.user, need to change all currentUsers to currentUser
                    .find(event => event.loan?.astLoan && !event.loan.astLoan.returnEvent)?.eventId

                asset.pastUsers = Array.from(
                    new Map(
                        asset.history
                            .filter(event => event.loan?.astLoan && event.loan.astLoan.returnEvent) // Filter events with returnEvent
                            .map(event => [event.loan.user.userId, event.loan.user])
                    ).values()
                );

                asset.reserveEventId = asset.history
                    .find(event => event.reservation)?.eventId
            }

            res.json(asset);
        } catch (error) {
            logger.error("Error fetching asset details:", error);
            res.status(500).send({ error: error.message });
        }
    };

    async getAllEvents(assetId) {
        const eventRows = await Event.findAll({
            attributes: ['id', 'adminId', 'eventDate'],
            where: {
                [Op.or]: [
                    { '$AddedAsset.id$': assetId },
                    { '$DeletedAsset.id$': assetId },
                    { '$Loan->AstLoan.asset_id$': assetId },
                    { '$Reservation->AstLoan.asset_id$': assetId }
                ]
            },
            include: [
                {
                    model: Rmk,
                    attributes: ['id', 'text'],
                    include: {
                        model: Admin,
                        attributes: ['id', 'adminName'],
                        required: false
                    },
                    required: false
                },
                {
                    model: Admin,
                    attributes: ['id', 'adminName'],
                    required: false
                },
                {
                    model: Ast,
                    as: 'AddedAsset',
                    attributes: [], // todo add details so timeline can display
                    required: false
                },
                {
                    model: Ast,
                    as: 'DeletedAsset',
                    attributes: [],
                    required: false
                },
                {
                    model: Loan,
                    as: 'Loan',
                    required: false,
                    include: [
                        {
                            model: Usr,
                            attributes: ['id', 'userName', 'bookmarked']
                        },
                        {
                            model: AstLoan,
                            include: [
                                {
                                    model: Event,
                                    as: 'ReturnEvent',
                                    attributes: ['id', 'eventDate'],
                                    required: false,
                                    include: [
                                        {
                                            model: Rmk,
                                            attributes: ['id', 'text', 'remarkDate'],
                                            include: {
                                                model: Admin,
                                                attributes: ['id', 'adminName'],
                                                required: false
                                            }
                                        },
                                        {
                                            model: Admin,
                                            attributes: ['id', 'adminName'],
                                            required: false
                                        }
                                    ]
                                },
                                {
                                    model: Ast,
                                    attributes: ['id', 'serialNumber'],
                                }
                            ]
                        },
                        {
                            model: AccLoan,
                            attributes: ['id', 'count'],
                            required: false,
                            include: [
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName']
                                },
                                {
                                    model: AccReturn,
                                    attributes: ['id', 'count'],
                                    required: false,
                                    include: {
                                        model: Event,
                                        as: 'ReturnEvent',
                                        attributes: ['id', 'eventDate'],
                                        required: true,
                                        include: [
                                            {
                                                model: Rmk,
                                                attributes: ['id', 'text', 'remarkDate'],
                                                include: {
                                                    model: Admin,
                                                    attributes: ['id', 'adminName'],
                                                    required: false
                                                }
                                            },
                                            {
                                                model: Admin,
                                                attributes: ['id', 'adminName'],
                                                required: false
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                    ]
                },
                {
                    model: Loan,
                    required: false,
                    as: 'Reservation',
                    where: { loanEventId: { [Op.eq]: null }},
                    include: [
                        {
                            model: Usr,
                            attributes: ['id', 'userName', 'bookmarked']
                        },
                        {
                            model: AstLoan,
                            attributes: ['id'],
                        },
                        {
                            model: AccLoan,
                            attributes: ['id', 'count'],
                            required: false,
                            include: [
                                {
                                    model: AccType,
                                    attributes: ['id', 'accessoryName']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [
                [
                  Sequelize.literal(`
                    CASE
                      WHEN "DeletedAsset"."id" IS NOT NULL THEN 0
                      WHEN "AddedAsset"."id" IS NOT NULL THEN 2
                      ELSE 1
                    END
                  `),
                  'ASC'
                ],
                ['eventDate', 'DESC']
            ]
        });

        const events = eventRows.map(row => new EventDTO(row)); // Converts Sequelize instances to plain objects
        logger.info(events);

        return events;
    }
    
    updateAsset = async (req, res, next) => {
        let { name, itemId, newValue } = req.body;
        
        try {
            if (['typeName', 'subTypeName', 'vendorName'].includes(name)) {
                let model;
                let attr;
                let refModel;
                let refAttr;
            
                switch (name) {
                    case 'typeName':
                        model = AstType;
                        attr = 'typeName';
                        refModel = AstSType;
                        refAttr = 'assetTypeId';
                        break;
                    case 'subTypeName':
                        model = AstSType;
                        attr = 'subTypeName';
                        refModel = Ast;
                        refAttr = 'subTypeId';
                        break;
                    case 'vendorName':
                        model = Vendor;
                        attr = 'vendorName';
                        refModel = Ast;
                        refAttr = 'vendorId';
                        break;
                    default:
                        throw new Error('Invalid name');
                }

                if (req.body.updateType === 'update-delete') {
                    await this.replaceOldValue({...req.body, model, attr, refModel, refAttr});
                } else {
                    await this.updateNewValue({...req.body, model, attr, refModel, refAttr});
                }
                res.json({ message: "Asset updated successfully" });
            } else {
                if (name === 'value') newValue = parseFloat(newValue);

                const asset = await Ast.findByPk(itemId);
        
                if (asset) {
                    asset[name] = newValue;
                    await asset.save();
                    res.json({ message: "Asset updated successfully" });
                } else {
                    res.status(404).json({ error: "Ast not found" });
                }
            }
        } catch (error) {
            logger.error(error);
            next(error);
        }
    };

    updateNewValue = async (metadata) => {
        // update-one
        // Find existing. if not exist, create. If exist, update that one. typeName → might have to create new subType under that type. update asset

        // update-keep
        // find existing. 
        let {itemId, name, newId, newValue, updateType, model, refModel, refAttr} = metadata;
        console.log(newId);
        const t = await sequelize.transaction();
        try {
            let existingRow = await model.findByPk(newId);

            if (!existingRow) throw new Error(`${newValue} must be created first!`)
            
            let currentItem = await Ast.findByPk(itemId);
            if (name === 'typeName') {
                const currentSubType = await AstSType.findByPk(currentItem.subTypeId);
                if (!currentSubType) throw new Error(`Unable to find subtype with ID ${currentItem.subTypeId}!`)
                
                if (updateType === "update-one") {
                    throw new Error(`Cannot Duplicate Model ${currentSubType.subTypeName} as it already exists under another Asset Type.`)
                } else {
                    await currentSubType.update({ assetTypeId: existingRow.id });
                }
            } else {
                if (updateType === "update-one") {
                    await currentItem.update({ [refAttr] : existingRow.id })
                } else {
                    await refModel.update(
                        { [refAttr]: existingRow.id },
                        {
                            where: {
                                [refAttr]: currentItem[refAttr]
                            }
                        }
                    )
                }
            }
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    replaceOldValue = async (metadata) => {

        const { model, refModel, refAttr, oldId, newId, newValue } = metadata;
    
        const t = await sequelize.transaction();

        // update-delete
        try {
            const existingRow = await model.findOne({
                where: { id: newId },
                transaction: t
            });
    
            if (existingRow) {
                // Point all references to newId
                await refModel.update(
                    { [refAttr]: newId },
                    {
                        where: { [refAttr]: oldId },
                        transaction: t,
                    }
                );
                // Delete old entry
                await model.destroy({
                    where: { id: oldId },
                    transaction: t
                });
            } else {
                // Just rename
                await model.update(
                    { [attr]: newValue },
                    {
                        where: { id: oldId },
                        transaction: t,
                    }
                );
            }
    
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    };
}

module.exports = new AssetController();