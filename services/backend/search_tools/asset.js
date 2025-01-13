class AssetSearch {

    assetIsDeleted = (asset) => !!asset.deletedDate
    assetIsLoaned = (asset) => asset.onLoan || !asset.shared
    assetIsReserved = (asset) => asset.onReservation || !asset.shared

    assetIsAvailable = (asset) => !this.assetIsDeleted(asset) && !this.assetIsLoaned(asset) && !this.assetIsReserved(asset)

    orderByOnLoanClause = `
        ORDER BY 
            CASE 
                WHEN "lastLoan" IS NOT NULL and "lastReturn" IS NOT NULL AND "lastLoan" > "lastReturn" THEN 1
                WHEN "deletedDate" IS NOT NULL THEN 2
                ELSE 3
            END ASC,
        "lastLoan" ASC
    `;

    orderByAvailableClause = `
        ORDER BY 
            CASE 
                WHEN "deletedDate" IS NOT NULL THEN 4
                WHEN "lastLoan" IS NOT NULL AND "lastReturn" IS NOT NULL AND "lastLoan > lastReturn" THEN 3 -- on loan
                WHEN "lastReserve" IS NOT NULL AND "lastReturn" IS NOT NULL AND "lastReserve > lastReturn" THEN 2 -- on reservation
                ELSE 1
            END ASC,
        "lastReturn" DESC
    `;

    constructor(
        value, 
        selectOnLoan, // else order by available
        userName=null
    ) {
        this.value = value;
        this.isBulkSearch = Array.isArray(value) ? true : false;
        this.searchTerm = isBulkSearch ? value : `%${value}%`;

        this.orderByClause = selectOnLoan ? this.orderByOnLoanClause : this.orderByAvailableClause;
        this.disabledCondition = selectOnLoan ? this.assetIsLoaned : this.assetIsAvailable

        this.userName = userName;
    }

    bulkCondition = `
        asts.serial_number IN ${this.searchTerm}  -- Bulk search condition
    `;

    singleCondition = `
        (asts.asset_tag ILIKE :searchTerm OR asts.serial_number ILIKE ${this.searchTerm})  -- Single search condition
    `;

    loanDetailsJoin = `
        LEFT JOIN (
            SELECT 
                loans.id AS "loanId",
                loan_event.event_date AS "loanEventDate",
                ast_loans.asset_id AS "assetId",
                ROW_NUMBER() OVER (PARTITION BY ast_loans.asset_id ORDER BY loan_event.event_date DESC) AS rn
            FROM loans
            LEFT JOIN events AS loan_event ON loans.loan_event_id = loan_event.id
            LEFT JOIN ast_loans ON loans.id = ast_loans.loan_id
            WHERE loan_event.event_date IS NOT NULL
        ) AS lnd ON asts.id = lnd."assetId" AND lnd.rn = 1
    `;

    loanDetailsSelect = `,
        lnd."loanId" AS "loanId",
        lnd."loanEventDate AS "lastLoan"
    `;

    sql = `
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
                MAX(loan_event.event_date) AS "lastLoan",
                MAX(return_event.event_date) AS "lastReturn",
                MAX(reserve_event.event_date) AS "lastReserve"
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
            LEFT JOIN events AS loan_event ON loans.loan_event_id = loan_event.id
            LEFT JOIN events AS return_event ON ast_loans.return_event_id = return_event.id
            ${this.loanDetailsJoin}
            WHERE ${this.isBulkSearch ? this.bulkCondition : this.singleCondition}
            ${this.userName && ` AND usrs.user_name = ${this.userName}`}
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
        )
        SELECT * ,
            CASE
                WHEN ("lastLoan" IS NOT NULL AND "lastReturn" IS NULL) OR "lastLoan" > "lastReturn" THEN 1
                ELSE 0
            END AS "onLoan",
            CASE
                WHEN (("lastReserve" IS NOT NULL AND "lastReturn" IS NULL) OR "lastReserve" > "lastReturn") AND ("lastLoan" IS NULL OR "lastLoan" < "lastReturn") THEN 1
                ELSE 0
            END AS "onReservation"
        FROM AssetLoanCounts
        ${this.orderByClause}
        LIMIT 20;
    `;


    async search() {
        try {
            const assets = await sequelize.query(this.sql, {
                type: sequelize.QueryTypes.SELECT
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