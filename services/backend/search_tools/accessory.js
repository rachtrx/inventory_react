class AccessorySearch {

    constructor(
        value, 
        selectOnLoan, // else order by available
        userId=null
    ) {
        this.value = value;
        this.userId = userId;

        this.isBulkSearch = Array.isArray(value) ? true : false;
        this.searchTerm = this.isBulkSearch ? value : `%${value}%`;

        this.orderByClause = selectOnLoan ? this.orderByOnLoanClause : this.orderByAvailableClause;
        this.disabledCondition = selectOnLoan ? this.assetIsLoaned : this.assetIsAvailable

        this.condition = this.selectOnLoan ?
            `WHERE loan_event.id IS NOT NULL
                AND (acc_loans.count - COALESCE(SUM(acc_returns.count), 0)) > 0
                ${this.searchTerm ? ` AND acc_types.accessory_name ILIKE :searchTerm` : ""}` :
            `WHERE acc_types.accessory_name ${isBulkSearch ? 'IN (:searchTerm)' : 'ILIKE :searchTerm'}`

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
    `;

    async run() {

    }

    // Produces accessory options
    async searchAccessoriesOnLoan () {

        const sql = `
            WITH AccessoryLoanCounts AS (
                SELECT 
                    acc_loans.loan_id AS "loanId",
                    acc_loans.id AS "accLoanId",
                    acc_types.id,
                    acc_types.accessory_name AS "accessoryName",
                    (acc_loans.count - COALESCE(SUM(acc_returns.count), 0)) AS "unreturned",
                    JSON_BUILD_OBJECT(
                        'id', asts.id,
                        "serialNumber", asts.serial_number,
                        "assetTag", asts.asset_tag
                    ) AS "asset",
                    JSON_AGG(JSON_BUILD_OBJECT(
                        'id', usrs.id,
                        'username', usrs.userName
                    )) AS "users"
                FROM acc_loans
                LEFT JOIN acc_returns ON acc_loans.id = acc_returns.acc_loan_id
                LEFT JOIN acc_types ON acc_types.id = acc_loans.accessory_type_id
                LEFT JOIN loans ON acc_loans ON loans.id = acc_loans.loan_id
                LEFT JOIN ast_loans ON ast_loans.loan_id = loans.id
                LEFT JOIN asts ON ast_loans.asset_id = asts.id
                LEFT JOIN ast_s_types ON asts.sub_type_id = ast_s_types.id
                LEFT JOIN ast_types ON ast_s_types.asset_type_id = ast_types.id
                LEFT JOIN usrs ON usr_loans.user_id = usrs.id
                LEFT JOIN events AS loan_event ON loans.loan_event_id = loan_event.id
                
                GROUP BY acc_types.id, acc_types.accessory_name, asts.id, acc_loans.id
            ),
            RelatedAccessoryLoans AS (
                SELECT
                    acl.loanId,
                    acl.accessoryName,
                    acl.unreturned,
                    acl.asset,
                    acl.users,
                    JSON_AGG(JSON_BUILD_OBJECT(
                        'id', ral.id,
                        'count', ral.count
                    )) AS "relatedAccLoans"
                FROM AccessoryLoanCounts acl
                LEFT JOIN acc_loans ral ON acl.loanId = ral.loan_id
                LEFT JOIN acc_returns ON acl.id = acc_returns.acc_loan_id
                LEFT JOIN acc_types ON acc_types.id = ral.accessory_type_id
                WHERE acl.accLoanId != ral.id
                AND (ral.count - COALESCE(SUM(acc_returns.count), 0)) > 0
                GROUP BY acl.loanId, acl.accessoryName, acl.unreturned, acl.asset, acl.users
            )
            SELECT *
            FROM RelatedAccessoryLoans
            LIMIT 20;
        `;

        try {
            const accLoans = await sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: { searchTerm: this.value }
            });

            logger.info(accLoans);

            
    
            // const response = accLoans.map((accessory) => {
    
            //     const { id, accessoryName, stock } = accessory;
    
            //     return {
            //         accessoryTypeId: id,
            //         label: accessoryName,
            //         value: accessoryName,
            //         stock: stock,
            //     };
            // })
    
            res.json(response);
        } catch (error) {
            logger.error('Error fetching assets:', error)
            console.error('Error fetching assets:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    
}

module.exports = AccessorySearch;