const { Asset, AssetType, AssetTypeVariant, Vendor, User, GroupLoan, AssetLoan, Sequelize, sequelize, Event, UserLoan, Peripheral, PeripheralType, PeripheralLoan, Loan } = require('../models/postgres');
const { Op } = require('sequelize');
const { formTypes, createSelection, getAllOptions, getDistinctOptions } = require('./utils.js');
const logger = require('../logging.js');

const dateTimeObject = {
    weekday: 'short',
    hour: 'numeric' || '',
    minute: 'numeric' || '',
    day: 'numeric',
    month: 'short',
    year: '2-digit'
}
class AssetController {

    async getFilters(req, res) {
        const { field } = req.body;
    
        let options;
        try {
            if (['assetType', 'variantName', 'vendor'].includes(field)) {
                let meta = null;
                switch(field) {
                    case 'assetType':
                        meta = [AssetType, 'id', 'assetType'];
                        break;
                    case 'variantName':
                        meta = [AssetTypeVariant, 'id', 'variantName'];
                        break;
                    case 'vendor':
                        meta = [Vendor, 'id', 'vendorName'];
                        break;
                    default:
                        meta = null
                }
                logger.info(meta)
                options = await getAllOptions(meta)
            } else if (field === 'location') {
                const distinctOptions = await getDistinctOptions(Asset, field);
                options = createSelection(distinctOptions, field, field);
            } else if (field === 'age') {
                const devicesAgeQuery = `
                    SELECT DISTINCT 
                        FLOOR(DATE_PART('day', NOW() - e.event_date) / 365.25) AS age
                    FROM "assets" a
                    JOIN "events" e ON a.add_event_id = e.id;
                `;
                const distinctAges = await sequelize.query(devicesAgeQuery, {
                    type: Sequelize.QueryTypes.SELECT
                });
                options = createSelection(distinctAges, field, field);
    
            } else throw new Error()
            
            return res.json(options || [])
            
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    async getAssets(req, res) { // TODO Add filters
    
        const { filters } = req.body
        logger.info(filters)
    
        const assetsExist = await Asset.count();
        if (assetsExist === 0) {
            return res.json([]);
        }
    
        const whereClause = {
            ...(filters.serialNumber && { serialNumber: { [Op.iLike]: filters.serialNumber } }),
            ...(filters.assetTag && { assetTag: { [Op.iLike]: filters.assetTag } }),
            ...(filters.location.length > 0 && { location: filters.location }),
        };
    
        try {
            let query = await Asset.findAll({
                attributes: [
                    'id',
                    'serialNumber',
                    'assetTag',
                    'location',
                    'shared',
                    'bookmarked',
                    'value',
                ],
                include: [
                    {
                        model: AssetTypeVariant,
                        attributes:['variantName'],
                        ...(filters.variantName.length > 0 && { where: { id: { [Op.in]: filters.variantName } } }),
                        include: {
                            model: AssetType,
                            attributes: ['assetType'],
                            ...(filters.assetType.length > 0 && { where: { id: { [Op.in]: filters.assetType } } }),
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
                        model: AssetLoan,
                        attributes: ['id', 'returnEventId'],
                        include: {
                            model: Loan,
                            attributes: ['id', 'reserveEventId', 'loanEventId'],
                            include: {
                                model: UserLoan,
                                attributes: ['id'],
                                include: {
                                    model: User,
                                    attributes: ['id', 'userName', 'bookmarked'],
                                },
                            },
                            where: { cancelEventId: null },
                        },
                        where: { returnEventId: null },
                        required: false
                    }
                ],
                where: whereClause
            })
    
            if (filters.age.length > 0) {
                query = query.filter(asset => {
                    const assetAge = Math.floor((new Date() - new Date(asset.addedDate)) / (365.25 * 24 * 60 * 60 * 1000));
                    return filters.age.includes(assetAge);
                });
            }
    
            if (filters.status.length > 0) {
                query = query.filter(asset => {
                    const hasLoan = asset.AssetLoans.some(loan => !loan.UserLoan.returnEventId && loan.UserLoan.loanEventId);
                    const isShared = asset.shared;

                    // next line: dont need to filter out cancelled reservations (done in query already) 
                    const isReserved = asset.AssetLoans && asset.AssetLoans.some(loan => loan.UserLoan.reserveEventId && !loan.UserLoan.loanEventId);
                    const isDeleted = asset.DeleteEvent !== null;
        
                    if (filters.status.includes('Condemned') && isDeleted) {
                        return true;
                    }
        
                    if (filters.status.includes('Available') && (isShared || !hasLoan && !isDeleted)) {
                        return true;
                    }
        
                    if (filters.status.includes('Reserved') && isReserved) {
                        return true;
                    }
                    
                    if (filters.status.includes('Unavailable') && !isShared && (isReserved || hasLoan)) {
                        return true;
                    }
        
                    return false;
                });
            }
    
            const result = query.map(asset => {
                return asset.createAssetObject();
            });
    
            // logger.info(result.slice(100, 110));
            res.json(result);
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    async searchAssets(req, res) {
        const { value, formType } = req.body;

        const isBulkSearch = Array.isArray(value) ? true : false;
        const searchTerm = isBulkSearch ? value : `%${value}%`;
    
        let orderByClause;
        if (formType === formTypes.LOAN) {
            orderByClause = `
                ORDER BY 
                    CASE 
                        WHEN ("loanCount" = 0 AND "reserveCount" = 0) THEN 1
                        WHEN "reserveCount" > 0 THEN 2
                        WHEN "loanCount" > 0 THEN 3
                        WHEN "deletedDate" IS NOT NULL THEN 4
                        ELSE 5
                    END ASC,
                "lastReturn" DESC
            `;
        } else if (formType === formTypes.RETURN) {
            orderByClause = `
                ORDER BY 
                    CASE 
                        WHEN "loanCount" > 0 THEN 1
                        WHEN "deletedDate" IS NOT NULL THEN 2
                        ELSE 3
                    END ASC,
                "lastLoan" ASC
            `;
        } else {
            throw new Error('Invalid form type provided.');
        }

        const bulkCondition = `
            assets.asset_tag IN (:searchTerm)  -- Bulk search condition
        `;

        const singleCondition = `
            (assets.asset_tag ILIKE :searchTerm OR assets.serial_number ILIKE :searchTerm)  -- Single search condition
        `;

        const sql = `
            WITH AssetLoanCounts AS (
                SELECT 
                    assets.id, 
                    assets.serial_number AS "serialNumber", 
                    assets.asset_tag AS "assetTag", 
                    assets.bookmarked,
                    assets.shared,
                    delete_event.event_date AS "deletedDate",
                    add_event.event_date AS "addedDate",
                    asset_type_variants.variant_name AS "variantName",
                    asset_types.asset_type AS "assetType",
                    vendors.vendor_name AS "vendorName",
                    MAX(loan_event.event_date) AS "lastLoan",
                    MAX(return_event.event_date) AS "lastReturn",
                    COUNT(
                        CASE 
                            WHEN loan_event.id IS NOT NULL 
                            AND return_event.id IS NULL 
                            THEN users.id 
                            ELSE NULL 
                        END
                    ) AS "loanCount",
                    COUNT(
                        CASE 
                            WHEN loan_event.id IS NULL 
                            AND return_event.id IS NULL 
                            AND cancel_event.id IS NULL 
                            AND reserve_event.id IS NOT NULL
                            THEN users.id 
                            ELSE NULL 
                        END
                    ) AS "reserveCount"
                FROM assets
                LEFT JOIN asset_type_variants ON assets.variant_id = asset_type_variants.id
                LEFT JOIN asset_types ON asset_type_variants.asset_type_id = asset_types.id
                LEFT JOIN vendors ON assets.vendor_id = vendors.id
                LEFT JOIN asset_loans ON assets.id = asset_loans.asset_id
                LEFT JOIN loans ON asset_loans.loan_id = loans.id
                LEFT JOIN user_loans ON loans.id = user_loans.loan_id
                LEFT JOIN users ON user_loans.user_id = users.id
                LEFT JOIN events AS delete_event ON assets.delete_event_id = delete_event.id
                LEFT JOIN events AS add_event ON assets.add_event_id = add_event.id
                LEFT JOIN events AS reserve_event ON loans.reserve_event_id = reserve_event.id
                LEFT JOIN events AS cancel_event ON loans.cancel_event_id = cancel_event.id
                LEFT JOIN events AS loan_event ON loans.loan_event_id = loan_event.id
                LEFT JOIN events AS return_event ON asset_loans.return_event_id = return_event.id
                WHERE ${isBulkSearch ? bulkCondition : singleCondition}
                GROUP BY 
                    assets.id, 
                    assets.serial_number, 
                    assets.asset_tag, 
                    assets.bookmarked, 
                    assets.shared, 
                    delete_event.event_date, 
                    add_event.event_date, 
                    asset_type_variants.variant_name, 
                    asset_types.asset_type, 
                    vendors.vendor_name
            )
            SELECT *
            FROM AssetLoanCounts
            ${orderByClause}
            LIMIT 20;
        `;
    
        try {
            const assets = await sequelize.query(sql, {
                replacements: { isBulkSearch, searchTerm },
                type: sequelize.QueryTypes.SELECT
            });
    
            const response = assets.map((asset) => {
                logger.info(asset);

                asset.loanCount = Number(asset.loanCount);
                asset.reserveCount = Number(asset.reserveCount);
                
                if (asset.deletedDate) {
                    asset.status = 'Deleted';
                } else if (asset.loanCount !== 0 && !asset.shared) {
                    asset.status = `On Loan: ${asset.loanCount} user${asset.loanCount === 1 ? '' : 's'}`;
                } else if (asset.reserveCount !== 0 && !asset.shared) {
                    asset.status = `Reserved: ${asset.reserveCount} user${asset.reserveCount === 1 ? '' : 's'}`;
                } else {
                    asset.status = `Available`;
                }
    
                const { id, assetTag, serialNumber, shared, status, assetType, variantName } = asset;
                logger.info(status)
                let disabled;
                switch(formType) {
                    case formTypes.LOAN:
                    case formTypes.DEL_ASSET:
                        disabled = status !== 'Available'
                        break;
                    case formTypes.RETURN:
                        disabled = status === 'Available'
                        break;
                }
    
                return {
                    value: id,
                    label: assetTag, // Append status if disabled,
                    assetType,
                    variantName, 
                    description: `${serialNumber} ${disabled ? `(${status})` : ''}`,
                    assetTag: assetTag,
                    shared: shared,
                    isDisabled: disabled // Disable if not in valid statuses or already included
                };
            })
    
            res.json(response);
        } catch (error) {
            logger.error('Error fetching assets:', error)
            console.error('Error fetching assets:', error);
            res.status(500).send('Internal Server Error');
        }
    };
    
    async getAsset (req, res) {
        const assetId = req.params.id;
    
        try {
            const assetDetails = await Asset.findOne({
                attributes: [
                    'id',
                    'serialNumber',
                    'assetTag',
                    'location',
                    'value',
                    'bookmarked',
                ],
                include: [
                    {
                        model: AssetTypeVariant,
                        attributes: ['variantName'],
                        include: {
                            model: AssetType,
                            attributes: ['assetType']
                        }
                    },
                    {
                        model: Vendor,
                        attributes: ['vendorName']
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
                        model: AssetLoan,
                        attributes: ['id'],
                        include: [
                            {

                                model: Loan,
                                attributes: ['expectedLoanDate', 'expectedReturnDate'],
                                include: [
                                    {
                                        model: Event,
                                        as: 'ReserveEvent',
                                        attributes: ['eventDate'],
                                        required: false
                                    },
                                    {
                                        model: Event,
                                        as: 'CancelEvent',
                                        attributes: ['eventDate'],
                                        required: false
                                    },
                                    {
                                        model: Event,
                                        as: 'LoanEvent',
                                        attributes: ['eventDate'],
                                        required: false,
                                    },
                                    {
                                        model: UserLoan,
                                        attributes: ['filepath'],
                                        include: {
                                            model: User,
                                            attributes: ['id', 'userName', 'bookmarked']
                                        }
                                    },
                                    {
                                        model: PeripheralLoan,
                                        attributes: ['id'],
                                        include: {
                                            model: Peripheral,
                                            attributes: ['id'],
                                            include: {
                                                model: PeripheralType,
                                                attributes: ['id', 'name'],
                                            },
                                        },
                                        where: { returnEventId: null },
                                        required: false,
                                    },
                                ],
                            },
                            {
                                model: Event,
                                attributes: ['eventDate'],
                                required: false,
                            },
                        ],
                        required: false
                    }
                ],
                where: { id: assetId }
            });
    
            if (!assetDetails) return res.status(404).send({ error: "Asset not found" });
    
            const asset = assetDetails.createAssetObject()
    
            logger.info('Details for Asset:', asset);
    
            res.json(asset);
        } catch (error) {
            logger.error("Error fetching asset details:", error);
            res.status(500).send({ error: "Internal server error" });
        }
    };
    
    async updateAsset(req, res) {
        const { id, field, newValue } = req.body;
        logger.info(`${id}, ${field}, ${newValue}`);
    
        try {
            const asset = await Asset.findByPk(id);
    
            if (asset) {
                asset[field] = newValue;
                await asset.save();
                res.json({ message: "Asset updated successfully" });
            } else {
                res.status(404).json({ message: "Asset not found" });
            }
        } catch (error) {
            res.json({ error: "An error occurred while updating the bookmark" });
        }
    };
}

module.exports = new AssetController();