const logger = require("../logging");
const { sequelize } = require("../models");

class AssetSearch {

    assetIsDeleted = (asset) => !!asset.deletedDate
    assetIsLoaned = (asset) => asset.loanStatus === 'loaned' || !asset.shared
    assetIsReserved = (asset) => asset.loanStatus === 'reserved' || !asset.shared

    assetIsAvailable = (asset) => !this.assetIsDeleted(asset) && !this.assetIsLoaned(asset) && !this.assetIsReserved(asset)

    orderByOnLoanClause = `
        ORDER BY 
            CASE 
                WHEN "deletedDate" IS NOT NULL THEN 3
                WHEN "loanStatus" IS NOT NULL and "loanStatus" = 'loaned' THEN 1
                ELSE 2
            END ASC,
        "lastLoan" ASC
    `;

    orderByAvailableClause = `
        ORDER BY 
            CASE 
                WHEN "deletedDate" IS NOT NULL THEN 4
                WHEN "loanStatus" IS NOT NULL and "loanStatus" = 'loaned' THEN 3 -- on loan
                WHEN "loanStatus" IS NOT NULL and "loanStatus" = 'reserved' THEN 2 -- on reservation
                ELSE 1
            END ASC,
        "lastReturn" DESC
    `;

    constructor(
        value, 
        selectOnLoan, // else order by available
        userId=null
    ) {
        this.value = value;
        this.isBulkSearch = Array.isArray(value) ? true : false;
        this.searchTerm = this.isBulkSearch ? value : `%${value}%`;

        this.orderByClause = selectOnLoan ? this.orderByOnLoanClause : this.orderByAvailableClause;
        this.disabledCondition = selectOnLoan ? this.assetIsLoaned : this.assetIsAvailable

        this.condition = this.isBulkSearch ? `
            asts.serial_number IN (:searchTerm)  -- Bulk search condition
        ` :
        `
            (asts.asset_tag ILIKE :searchTerm OR asts.serial_number ILIKE :searchTerm)  -- Single search condition
        `;

        if (userId) {
            this.condition += ` AND usrs.id = ${this.userId}`
        }
    }

    loanDetailsJoin = `
        LEFT JOIN (
            SELECT 
                loans.id AS "loanId",
                loan_event.event_date AS "lastLoan",
                ast_loans.asset_id AS "assetId",
                CASE
                    WHEN loans.loan_event_id IS NOT NULL THEN 'loaned'
                    WHEN loans.reserve_event_id IS NOT NULL THEN 'reserved'
                    ELSE NULL
                END AS "loanStatus",
                ROW_NUMBER() OVER (PARTITION BY ast_loans.asset_id ORDER BY loan_event.event_date ASC) AS rn
            FROM loans
            LEFT JOIN events AS loan_event ON loans.loan_event_id = loan_event.id
            LEFT JOIN ast_loans ON loans.id = ast_loans.loan_id
            WHERE ast_loans.return_event_id IS NULL
        ) AS lnd ON asts.id = lnd."assetId" AND lnd.rn = 1
    `;

    loanDetailsSelect = `,
        lnd."loanId" AS "loanId",
        lnd."loanStatus" AS "loanStatus",
        lnd."lastLoan" AS "lastLoan"
    `;

    loanDetailsGroup = `,
        lnd."loanId",
        lnd."loanStatus",
        lnd."lastLoan"
    `

    generate_sql() {
        return `
            WITH AssetLoanCounts AS (
                SELECT 
                    asts.id AS "assetId",
                    asts.serial_number AS "serialNumber", 
                    asts.asset_tag AS "assetTag", 
                    asts.bookmarked,
                    asts.shared,
                    delete_event.event_date AS "deletedDate",
                    add_event.event_date AS "addedDate",
                    ast_s_types.sub_type_name AS "subTypeName",
                    ast_types.type_name AS "typeName",
                    vendors.vendor_name AS "vendorName",
                    MAX(return_event.event_date) AS "lastReturn"
                    ${this.loanDetailsSelect}
                FROM asts
                LEFT JOIN ast_s_types ON asts.sub_type_id = ast_s_types.id
                LEFT JOIN ast_types ON ast_s_types.asset_type_id = ast_types.id
                LEFT JOIN vendors ON asts.vendor_id = vendors.id
                LEFT JOIN ast_loans ON asts.id = ast_loans.asset_id
                LEFT JOIN loans ON ast_loans.loan_id = loans.id
                LEFT JOIN usr_loans ON loans.id = usr_loans.loan_id
                LEFT JOIN usrs ON usr_loans.user_id = usrs.id
                LEFT JOIN events AS delete_event ON asts.del_event_id = delete_event.id
                LEFT JOIN events AS add_event ON asts.add_event_id = add_event.id
                LEFT JOIN events AS reserve_event ON loans.reserve_event_id = reserve_event.id
                LEFT JOIN events AS cancel_event ON loans.cancel_event_id = cancel_event.id
                LEFT JOIN events AS return_event ON ast_loans.return_event_id = return_event.id
                ${this.loanDetailsJoin}
                WHERE ${this.condition}
                GROUP BY 
                    asts.id, 
                    asts.serial_number, 
                    asts.asset_tag, 
                    asts.bookmarked, 
                    asts.shared, 
                    delete_event.event_date, 
                    add_event.event_date, 
                    ast_s_types.sub_type_name, 
                    ast_types.type_name, 
                    vendors.vendor_name
                    ${this.loanDetailsGroup}
            )
            SELECT *
            FROM AssetLoanCounts
            ${this.orderByClause}
            LIMIT 20;
        `;
    }


    async run() {
        logger.info(this.generate_sql())

        try {
            const assets = await sequelize.query(this.generate_sql(), {
                type: sequelize.QueryTypes.SELECT,
                replacements: { searchTerm: this.value }
            });
    
            const response = assets.map((asset) => {
                logger.info(asset);
                
                if (this.assetIsDeleted(asset)) {
                    asset.status = 'Deleted';
                } else if (this.assetIsLoaned(asset)) {
                    asset.status = `On Loan`;
                } else if (this.assetIsReserved(asset)) {
                    asset.status = `Reserved`;
                } else {
                    asset.status = `Available`;
                }
    
                const { assetId, assetTag, serialNumber, shared, status, typeName, subTypeName, loanId } = asset;
                logger.info(status)

                const isDisabled = this.disabledCondition(asset)
    
                return {
                    value: serialNumber,
                    label: serialNumber, // Append status if disabled,
                    assetId,
                    typeName,
                    subTypeName, 
                    description: `${serialNumber} ${isDisabled ? `(${status})` : ''}`,
                    shared: shared,
                    isDisabled, // Disable if not in valid statuses or already included
                    loanId,
                };
            })
    
            return response;
            
        } catch (error) {
            throw error;
        }
    }       
}

module.exports = AssetSearch;