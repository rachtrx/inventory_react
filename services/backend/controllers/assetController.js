const { Asset, AssetType, AssetTypeVariant, Vendor, User, Loan, Sequelize, sequelize, LoanDetail} = require('../models/postgres');
const { Op } = Sequelize;
const { formTypes, createSelection, getAllOptions, getDistinctOptions } = require('./utils')

const logger = require('../logging');
const mongodb = require('../models/mongo');

const dateTimeObject = {
    weekday: 'short',
    hour: 'numeric' || '',
    minute: 'numeric' || '',
    day: 'numeric',
    month: 'short',
    year: '2-digit'
}

exports.getFilters = async (req, res) => {
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
            const devicesAgeQuery = `SELECT DISTINCT 
                FLOOR(DATE_PART('day', NOW() - added_date) / 365.25) AS age
                FROM "assets"
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

exports.getAssets = async (req, res) => { // TODO Add filters

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
                'addedDate',
                'location',
                'bookmarked',
                'value',
                'deletedDate',
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
                    model: Vendor,
                    attributes:['vendorName'],
                    ...(filters.vendor.length > 0 && { where: { id: { [Op.in]: filters.vendor } } }),
                },
                {
                    model: Loan,
                    attributes: ['id'],
                    include: {
                        model: LoanDetail,
                        attributes: ['status', 'startDate', 'expectedReturnDate'],
                        include: {
                            model: User,
                            attributes: ['id', 'userName', 'bookmarked'],
                        }
                    }
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

        // logger.info(query.slice(1, 10))

        if (filters.status.length > 0) {
            query = query.filter(asset => {
                const hasLoan = asset.Loan;
                const isShared = asset.shared;

                const isDeleted = asset.deletedDate !== null;
    
                if (filters.status.includes('Condemned') && isDeleted) {
                    return true;
                }
    
                if (filters.status.includes('Available') && (isShared || !hasLoan && !isDeleted)) {
                    return true;
                }
    
                if (filters.status.includes('Reserved') && !isShared && hasLoan && asset.Loan.LoanDetails.some(loanDetail => loanDetail.status === 'PENDING')) {
                    return true;
                }
                
                if (filters.status.includes('Unavailable') && !isShared && hasLoan && asset.Loan.LoanDetails.some(loanDetail => loanDetail.status === 'COMPLETED')) {
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

exports.searchAssets = async (req, res) => {
    const { value, formType } = req.body;

    let orderByClause;
    if (formType === formTypes.LOAN || formType === formTypes.DEL_ASSET) {
        orderByClause = `
            ORDER BY 
                "deletedDate" IS NOT NULL ASC,
                "userIds" IS NOT NULL ASC,
                "updatedAt" DESC
        `;
        validStatuses = ['Available']
    } else if (formType === formTypes.RETURN) {
        orderByClause = `
            ORDER BY 
                "deletedDate" IS NOT NULL ASC,
                CARDINALITY("userIds") > 0 DESC,
                "updatedAt" DESC
        `;
        validStatuses = ['On Loan']
    } else {
        throw new Error('Invalid form type provided.');
    }
            
    const sql = `
        WITH AssetLoanCounts AS (
            SELECT 
                assets.id, 
                assets.serial_number AS "serialNumber", 
                assets.asset_tag AS "assetTag", 
                assets.bookmarked,
                assets.shared,
                assets.deleted_date AS "deletedDate", 
                asset_type_variants.variant_name AS "variantName",
                asset_types.asset_type AS "assetType",
                vendors.vendor_name AS "vendorName",
                assets.updated_at AS "updatedAt",
                CASE 
                    WHEN COUNT(users.id) = 0 THEN NULL
                    ELSE ARRAY_AGG(users.id) 
                END AS "userIds"
            FROM assets
            LEFT JOIN asset_type_variants ON assets.variant_id = asset_type_variants.id
            LEFT JOIN asset_types ON asset_type_variants.asset_type_id = asset_types.id
            LEFT JOIN vendors ON assets.vendor_id = vendors.id
            LEFT JOIN loans ON assets.loan_id = loans.id
            LEFT JOIN loan_details ON loans.id = loan_details.loan_id
            LEFT JOIN users ON loan_details.user_id = users.id
            WHERE (assets.asset_tag ILIKE :searchTerm OR assets.serial_number ILIKE :searchTerm)
            GROUP BY assets.id, asset_types.asset_type, asset_type_variants.variant_name, vendors.vendor_name
        )
        SELECT *
        FROM AssetLoanCounts
        ${orderByClause}
        LIMIT 20;
    `;

    try {
        const assets = await sequelize.query(sql, {
            replacements: { searchTerm: `%${value}%` },
            type: sequelize.QueryTypes.SELECT
        });

        response = assets.map((asset) => {
            logger.info(asset);
            
            if (asset.deletedDate) {
                asset.status = 'Deleted';
            } else if (asset.userIds?.length > 0) {
                asset.status = `${asset.userIds.length} user${asset.userIds.length > 1 ? 's' : ''}`;
            } else {
                asset.status = `Available`;
            }

            const { id, assetTag, serialNumber, shared, status, assetType, variantName } = asset;
            logger.info(status)
            let disabled;
            switch(formType) {
                case formTypes.LOAN:
                    disabled = status !== 'Available' && !shared
                    break;
                case formTypes.DEL_ASSET:
                    disabled = status !== 'Available'
                    break;
                case formTypes.RETURN:
                    disabled = status === 'Available'
                    break;
            }

            return {
                value: id,
                assetType,
                variantName, 
                label: `${assetTag} - ${serialNumber} ${disabled ? `(${status})` : ''}`, // Append status if disabled
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

exports.getAsset = async (req, res) => {
    const assetId = req.params.id;
    const { Event } = mongodb;

    try {
        const assetDetailsPromise = Asset.findOne({
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
                    model: Loan,
                    attributes: ['id'],
                    include: {
                        model: LoanDetail,
                        attributes: ['status', 'startDate', 'expectedReturnDate'],
                        include: {
                            model: User,
                            attributes: ['id', 'userName', 'bookmarked']
                        },
                    },
                    required: false
                }
            ],
            where: { id: assetId }
        });

        const assetEventsPromise = Event.find({ assetId }).sort({ eventDate: -1 });

        const [assetDetails, assetEvents] = await Promise.all([assetDetailsPromise, assetEventsPromise]);

        if (!assetDetails) return res.status(404).send({ error: "Asset not found" });

        const asset = assetDetails.createAssetObject()

        asset.events = assetEvents;

        logger.info('Details for Asset:', asset);

        res.json(asset);
    } catch (error) {
        logger.error("Error fetching asset details:", error);
        res.status(500).send({ error: "Internal server error" });
    }
};

exports.bookmarkAsset = async (req, res) => {
    const { id, bookmarked } = req.body;

    try {
        const asset = await Asset.findByPk(id);

        if (asset) {
            asset.bookmarked = bookmarked === true ? 1 : 0;
            await asset.save();
            res.json({ message: "Bookmark updated successfully" });
        } else {
            res.status(404).json({ message: "Asset not found" });
        }
    } catch (error) {
        res.json({ error: "An error occurred while updating the bookmark" });
    }
};