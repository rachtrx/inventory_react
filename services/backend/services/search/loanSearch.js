const { Op, literal } = require("sequelize");
const { Admin, Ast, AccType, Usr, Loan, AstLoan, AccReturn, AccLoan, Event, Dept, AstSType, AstType } = require("@models");

class LoanSearch {

    setMinimumRequirement = (accTypeId) => ({
        [Op.or]: [
            literal(`EXISTS (
                SELECT 1 FROM ast_loans
                WHERE ast_loans.return_event_id IS NULL
                AND ast_loans.id = "AstLoan"."id"
                )`),
            literal(`EXISTS (
				SELECT 1
				FROM "acc_loans" AS "al"
				LEFT JOIN "acc_returns" AS "ar" ON "ar"."acc_loan_id" = "al"."id"
				${accTypeId ? `WHERE "al"."accessoryTypeId" = ${accTypeId}`: ""}
				GROUP BY "al"."id", "al"."loan_id"
				HAVING
					"al"."loan_id" = "Loan"."id"
					AND COALESCE(SUM("ar"."count"), 0) < "al"."count"
			)`),
        ]
    })
    
    getLoans = async ({
		sortCondition,
		whereClause
	}) => {
		return await Loan.findAll({
			logger: console.log,
			where: {
				[Op.and]: [...whereClause, Loan.TOP_LEVEL_ON_LOAN_WHERE_CLAUSE]
			},
			include: [
				{
					model: Event,
					required: true,
					as: "LoanEvent",
					include: {
						model: Admin,
						required: false
					}
				},
				{
					model: Usr,
					attributes: ['id', 'userName'],
					include: [
						{
							model: Dept,
							attributes: ['id', 'deptName']
						},
					],
				},
				{
					model: AstLoan,
					required: false,
					include: [
						{
							model: Ast,
							attributes: ['id', 'serialNumber'], // todo add details so timeline can display
							required: false,
							include: [
								{
									model: AstSType,
									attributes: ['id','subTypeName'],
									include: {
										model: AstType,
										attributes: ['id', 'typeName'],
									},
								},
							]
						}
					]
				},
				{
					model: AccLoan,
					required: false,
					include: [
						{
							model: AccReturn
						},
						{
							model: AccType
						}
					]
				}
			],
			order: sortCondition ? [sortCondition] : [['expectedReturnDate', 'ASC']]
		});
	}

	getLoansById = async ({
		astTypeId,
		astSTypeId,
		userId,
		accTypeId,
		startDate = undefined,
		endDate = undefined,
		status = Loan.COMPLETED,
		sortCondition,
		initialWhereClause
	} = {}) => {

		let statusCondition = null;
		switch(status) {
			case Loan.RESERVED:
				statusCondition = { 'loanEventId': {[Op.eq]: null} }
                break;
			case Loan.COMPLETED:
				statusCondition = { 'loanEventId': {[Op.ne]: null} }
                break;
		}
		
		const whereClause = [
			...(initialWhereClause ? initialWhereClause : []),
			...(statusCondition ? [statusCondition] : []),
			...(accTypeId ? [{ '$AccLoans->AccType.id$': accTypeId }] : []),
			...(astTypeId ? [{ '$AstLoan->Ast->AstSType->AstType.id$': astTypeId }] : []),
			...(astSTypeId ? [{ '$AstLoan->Ast->AstSType.id$': astSTypeId }] : []),
			...(userId ? [{ '$Usr.id$': userId }] : []),
			...(startDate ? [{ '$LoanEvent.eventDate$': { [Op.gte]: startDate } }] : []),
			...(endDate ? [{ '$LoanEvent.eventDate$': { [Op.lte]: endDate } }] : []),
		];

		return await this.getLoans({ sortCondition, whereClause })
	}
}


module.exports = { LoanSearch };