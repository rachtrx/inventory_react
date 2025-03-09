const { Ast, AstType, AstSType, Vendor, Usr, AstLoan, Sequelize, sequelize, Event, AccType, AccLoan, AccReturn, Loan, Admin, Rmk, AstTagMap, AstTag } = require('../models/index.js');
const { Op } = require('sequelize');
const { createSelection, getAllOptions, getDistinctOptions, getAssetFilters, getSubTypes } = require('./utils.js');
const logger = require('../logging.js');
const AssetDTO = require('../dtos/ast.dto.js');
const EventDTO = require('../dtos/event.dto.js');

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
    
    async getAssets(req, res) { // TODO Add filters
    
        const { filters } = req.body
        logger.info(filters)
    
        const assetsExist = await Ast.count();
        if (assetsExist === 0) {
            return res.json([]);
        }
    
        const whereClause = {
            ...(filters.serialNumber && { serialNumber: { [Op.iLike]: `%${filters.serialNumber}%` } }),
            ...(filters.location.length > 0 && { location: filters.location }),
            ...(filters.bookmarked && { bookmarked: true }),
        };
    
        try {
            let query = await Ast.findAll({
                attributes: [
                    'id',
                    'serialNumber',
                    'alias',
                    'location',
                    'bookmarked',
                    'value'
                ],
                include: [
                    {
                        model: AstTagMap,
                        attributes: ['id'],
                        where: { delEventId: { [Op.eq]: null }}, 
                        include: {
                            model: AstTag,
                            attributes: ['id', 'tagName'],
                            ...(filters.assetTag.length > 0 && { where: { id: { [Op.in]: filters.assetTag } } }),
                        },
                        required: filters.assetTag.length > 0 ? true : false
                    },
                    {
                        model: AstSType,
                        attributes: ['subTypeName'],
                        ...(filters.subTypeName.length > 0 && { where: { id: { [Op.in]: filters.subTypeName } } }),
                        include: {
                            model: AstType,
                            attributes: ['typeName'],
                            ...(filters.typeName.length > 0 && { where: { id: { [Op.in]: filters.typeName } } }),
                            required: true,
                        },
                        required: true,
                    },
                    {
                        model: Event,
                        as: 'AddEvent',
                        attributes: ['eventDate']
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
                        ...(filters.vendor.length > 0 && { where: { id: { [Op.in]: filters.vendor } } }),
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
                where: whereClause
            })
    
            if (filters.age.length > 0) {
                query = query.filter(asset => {
                    const assetAge = Math.floor((new Date() - new Date(asset.AddEvent.eventDate)) / (365.25 * 24 * 60 * 60 * 1000));
                    return filters.age.includes(String(assetAge));
                });
            }

            let result = query.map(assetRow => {
                const asset = new AssetDTO(assetRow).setOngoingLoan().setOngoingReservation();
                return asset;
            });
    
            if (filters.status.length > 0) {
                result = result.filter(asset => {
                    const hasLoan = asset.ongoingLoan ? true : false;

                    // next line: dont need to filter out cancelled reservations (done in query already) 
                    const isReserved = asset.ongoingReservation ? true : false;
                    const isDeleted = asset.delEventId ? true : false;
        
                    if (filters.status.includes('Condemned') && isDeleted) {
                        return true;
                    }
        
                    if (filters.status.includes('Available') && (!hasLoan && !isDeleted)) {
                        return true;
                    }
        
                    if (filters.status.includes('Reserved') && isReserved) {
                        return true;
                    }
                    
                    if (filters.status.includes('Unavailable') && (isReserved || hasLoan)) {
                        return true;
                    }
        
                    return false;
                });
            }
    
            logger.info(result.slice(100, 110));
            res.json(result);
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
    
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
                        attributes: ['subTypeName'],
                        include: {
                            model: AstType,
                            attributes: ['typeName']
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

                asset.currentUser = asset.history // TODO fixed loan.user, need to change all currentUsers to currentUser
                    .find(event => event.loan?.astLoan && !event.loan.astLoan.returnEvent)?.loan.user

                asset.pastUsers = Array.from(
                    new Map(
                        asset.history
                            .filter(event => event.loan?.astLoan && event.loan.astLoan.returnEvent) // Filter events with returnEvent
                            .map(event => [event.loan.user.userId, event.loan.user])
                    ).values()
                );

                asset.reservedUser = asset.history
                    .find(event => event.reservation)?.loan.user
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
            order: [['eventDate', 'DESC']]
        });

        const events = eventRows.map(row => new EventDTO(row)); // Converts Sequelize instances to plain objects
        logger.info(events);

        return events;
    }
    
    async updateAsset(req, res) {
        const { id, field, newValue } = req.body;
        logger.info(`${id}, ${field}, ${newValue}`);
    
        try {
            const asset = await Ast.findByPk(id);
    
            if (asset) {
                asset[field] = newValue;
                await asset.save();
                res.json({ message: "Ast updated successfully" });
            } else {
                res.status(404).json({ message: "Ast not found" });
            }
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    };
}

module.exports = new AssetController();