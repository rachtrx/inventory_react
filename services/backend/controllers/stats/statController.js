const { Sequelize, Ast, AstType, AstSType, Loan, AstLoan, Usr, Dept, sequelize, Event, AccLoan, AccType, AccReturn } = require('@models/index.js');
const { Op } = require('sequelize');
const { Chart, OneToOneChart, ManyToManyChart } = require('./chartDataController.js');
const logger = require('@/utils/logging.js');
const LoanDTO = require('@dtos/loan.dto.js');

class StatController {

	constructor() {
        this.prepareChartData = this.prepareChartData.bind(this);
        this.dashboard = this.dashboard.bind(this);
    }

	async dashboard (req, res, next) {
		try {
			// Top devices
			const topDevicesByCount = await AstSType.findAll({
				attributes: [
					[Sequelize.col('AstType.type_name'), 'label'],  // Explicitly name the attribute as used in the GROUP BY and ORDER BY
					[Sequelize.fn('COUNT', Sequelize.col('AstType.type_name')), 'data'] // Count the asset types
				],
				include: [{
					model: AstType,
					attributes: [],  // Include only the 'type_name' from AstType
				},{
					model: Ast,
					attributes: [],  // Include only the 'type_name' from AstType
					where: {
						delEventId: { [Op.eq]: null }
					},
				}],
				group: ['label'],  // Group by the type_name of the AstType model
				order: [[Sequelize.fn('COUNT', Sequelize.col('AstType.type_name')), 'DESC']],  // Order by the count of asset types
				raw: true,
				subQuery: false  // May help in certain complex grouping scenarios
			});

			logger.info(topDevicesByCount)
			
			// Top Ast Types by Value
			const topDevicesByValue = await AstSType.findAll({
				attributes: [
					[Sequelize.col('AstType.type_name'), 'label'],
					[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Asts.value'), 'FLOAT')), 'data']
				],
				include: [
					{
						model: Ast,
						attributes: [],
						where: {
							delEventId: { [Op.eq]: null }
						},
						// required: true  // Ensures an inner join, excluding AssetTypeVariants without valid Assets
					},
					{
						model: AstType,
						attributes: []  // Including 'id' as you want to group by it
					}
				],
				group: ['label'],  // Group by typeName and id from AstType
				having: Sequelize.where(Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Asts.value'), 'FLOAT')), '!=', 0),
				order: [[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Asts.value'), 'FLOAT')), 'DESC']],
				raw: true
			});

			logger.info(topDevicesByValue)

			const assetStatus = await Ast.findAll({
				attributes: [
					[Sequelize.literal(`CASE
						WHEN "AstLoans->Loan"."loan_event_id" IS NOT NULL THEN 'Unavailable'
						WHEN "AstLoans->Loan"."reserve_event_id" IS NOT NULL THEN 'Reserved' 
						ELSE 'Available' 
					END`), 'label'],
					[Sequelize.fn('COUNT', Sequelize.col('*')), 'data']
				],
				include: [
					{
						model: AstLoan,
						attributes: [],
						where: {
							returnEventId: { [Op.eq]: null }
						},
						include: {
							model: Loan,
							attributes: [],
						},
						required: false
					}
				],
				where: {
					delEventId: { [Op.eq]: null }
				},
				group: ['label'],
				raw: true
			});

			logger.info(assetStatus)
	
			// Users by department
			const users = await Usr.findAll({
				attributes: [
					[Sequelize.col('Dept.dept_name'), 'label'],
					[Sequelize.fn('COUNT', Sequelize.col('Dept.dept_name')), 'data']
				],
				include: [{
					model: Dept,
					attributes: []
				}],
				where: {
					delEventId: {
						[Op.eq]: null
					}
				},
				group: 'label',
				order: [[Sequelize.fn('COUNT', Sequelize.col('Dept.dept_name')), 'ASC']],
				raw: true
			});

			logger.info(users)

			const usersLoan = await Usr.findAll({
				attributes: [
					[Sequelize.col('Dept.dept_name'), 'label'],
					[Sequelize.fn('COUNT', Sequelize.col('"Loans->AstLoan"."id"')), 'data']
				],
				include: [
					{
						model: Dept,
						attributes: []
					},
					{
						model: Loan,
                        attributes: [],
						include: {
							model: AstLoan,
							attributes: [],
							where: {
								returnEventId: {
									[Op.eq]: null
								}
							}
						},
                        where: {
                            loanEventId: {
                                [Op.ne]: null
                            }
                        }
					}
				],
				where: {
					delEventId: {
						[Op.eq]: null
					}
				},
				group: 'label',
				order: [[Sequelize.fn('COUNT', Sequelize.col('Dept.dept_name')), 'ASC']],
				raw: true
			});

			logger.info(usersLoan)
			
			// Age of assets
			const devicesAge = await Ast.findAll({
				attributes: [
				  [Sequelize.literal(`FLOOR(DATE_PART('day', NOW() - "AddEvent"."event_date") / 365.25)`), 'label'],
				  [Sequelize.fn('COUNT', Sequelize.col('*')), 'data']
				],
				include: {
					model: Event,
					as: "AddEvent",
					attributes: []
				},
				where: {
				  delEventId: { [Op.is]: null }
				},
				group: [Sequelize.literal(`FLOOR(DATE_PART('day', NOW() - "AddEvent"."event_date") / 365.25)`)],
				order: [[Sequelize.literal(`label`), 'DESC']],
				raw: true
			  });

			  logger.info(devicesAge)
	
			// Top Models
			const topVariantsByCount = await AstSType.findAll({
				attributes: [
						['sub_type_name', 'label'],
						[Sequelize.fn('COUNT', Sequelize.col('sub_type_name')), 'data'],
						[Sequelize.col('AstType.type_name'), 'group']
				],
				include: [{
						model: Ast,
						attributes: [],  // No attributes are needed from the Ast model directly
						where: {
							delEventId: { [Op.eq]: null }
						},
				}, {
						model: AstType,
						attributes: []  // Including AstType but not selecting attributes directly here, used in the top-level attributes instead
				}],
				group: ['group', 'label'], // TODO check...
				order: [['data', 'DESC']],
				raw: true
			});

			logger.info(topVariantsByCount)
	
			const topVariantsByValue = await AstSType.findAll({
				attributes: [
						['sub_type_name', 'label'],  
						[Sequelize.fn('SUM', Sequelize.col('Asts.value')), 'data'],
						[Sequelize.col('AstType.type_name'), 'group']
				],
				include: [{
						model: Ast,
						attributes: [],
						where: {
							delEventId: { [Op.eq]: null }
						},
						where: {
							value: { [Op.ne]: 0 }
						}
				}, {
						model: AstType,
						attributes: []
				}],
				group: ['group', 'label'],
				order: [['data', 'DESC']],
				raw: true
			});

			logger.info(topVariantsByValue)
			
			// Cost per year
			const costPerYearByAsset = await Ast.findAll({
				attributes: [
					[Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "AddEvent"."event_date"')), 'group'],
					[Sequelize.fn('SUM', Sequelize.col('value')), 'data'],
					[Sequelize.col('"AstSType->AstType"."type_name"'), 'label']
				],
				include: [
					{
						model: AstSType,
						attributes: [],
						include: {
							model: AstType,
							attributes: []
						}
					},
					{
						model: Event,
                        as: 'AddEvent',
                        attributes: []
					}
				],
				where: {
					delEventId: { [Op.eq]: null }
				},
				group: ['group', '"AstSType->AstType"."type_name"'],
				order: [['group', 'ASC'], ['label', 'ASC']],
				raw: true
			});
	
			logger.info(costPerYearByAsset);
	
			
			const chartDataInputs = [
				{
					'data': topDevicesByCount,
					'generate': (chart) => chart.setSumValue().reduceDataSize(),
				},
				{
					'data': topDevicesByValue,
					'isCurrency': true,
					'generate': (chart) => chart.setSumValue().reduceDataSize(),
				},
				{
					'data': assetStatus,
					'generate': (chart) => chart.setPctValue(['loaned']).reduceDataSize(),
				},
				{
					'data': users,
					'generate': (chart) => chart.setSumValue().reduceDataSize(),
				},
				{
					'data': usersLoan,
					'generate': (chart) => chart.setSumValue().reduceDataSize(),
				},
				{
					'data': devicesAge,
					'generate': (chart) => chart
						.setAvgValue()
						.addSuffixToLabels(' years')
						.reduceDataSize()
				},
				{
					'data': topVariantsByCount,
					'chartType': OneToOneChart,
					'generate': (chart) => chart.generateData()
				},
				{
					'data': topVariantsByValue,
					'isCurrency': true,
					'chartType': OneToOneChart,
					'generate': (chart) => chart.generateData()
				},
				{
					'data': costPerYearByAsset,
					'isCurrency': true,
					'chartType': ManyToManyChart,
					'generate': (chart) => chart
						.generateData()
						.aggregateDataByGroup()
						.mapYearToTotalCost()
				}
	
			];
	
			const chartNames = [
				'topDevicesByCount', 'topDevicesByValue', 'deviceAvailability',
				'usersByDepartment', 'loansByDepartment', 'ageOfDevices', 'topVariantsByCount', 
				'topVariantsByValue', 'costPerYearByAsset'
			];

			console.log("this before map:", this);
		
			const charts = chartDataInputs.map(this.prepareChartData.bind(this));
		
			const response = charts.reduce((obj, chart, index) => {
				obj[chartNames[index]] = chart;
				return obj;
			}, {});
		
			// Prepare the special charts
		
			console.log(response);
	
			// Send JSON response
			res.json(response);
			
		} catch(error) {
			logger.error(error)
			next(error)
		}
	}
	
	prepareChartData = (pipeline) => {
		if (!pipeline) return { 'data': null, 'agg': null };
	
		const { data = null, generate, chartType = Chart, isCurrency = false } = pipeline;
		const chart = new chartType(data, isCurrency);
		let aggData = null;
	
		generate(chart);
		console.log(JSON.stringify(chart.getData(), null, 2));
	
		return {
			'data': chart.getData(),
			...(aggData ? { 'agg': aggData } : {}),
			'isCurrency': chart.isCurrency,
			'chartShape': chart.chartShape
		};
	}

	getScheduledReturns = async(req, res) => {
		try {
			const query = await Loan.findAll({
				include: [
					{
						model: Usr
					},
					{
						model: AstLoan,
						required: false,
						include: {
							model: Ast,
							include: {
								model: AstSType,
								include: {
									model: AstType
								}
							}
						}
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
				where: {
					[Op.and]: [
						{
							expectedReturnDate: {
								[Op.gte]: new Date()
							}
						},
						{
							[Op.or]: [
								Sequelize.literal(`EXISTS (
									SELECT 1 FROM ast_loans
									WHERE ast_loans.return_event_id IS NULL
									AND ast_loans.id = "AstLoan"."id"
								)`),
								Sequelize.literal(`EXISTS (
									SELECT 1
									FROM "acc_returns" AS "AccReturns"
									WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
									GROUP BY "AccLoans"."id"
									HAVING COALESCE(SUM("AccReturns"."count"), 0) <= "AccLoans"."count"
								)`),
							]
						}
					]
				},
				order: [['expectedReturnDate', 'ASC']]
			})
			const loans = query.map(loan => new LoanDTO(loan));
			res.json(loans);
		} catch (err) {
			res.status(500).json({ error: "Unable to retrieve reminders" });
		}
	}

	async updateExpectedReturnDate (req, res) {
        const { loanIds, newReturnDate } = req.body;

        const uniqueLoanIds = [...new Set(loanIds)]; // just for sanity check

        const transaction = await sequelize.transaction();

        try {
			if (!newReturnDate) throw new Error("Return Date cannot be null")

			// Fetch the loans in the transaction context
			const loans = await Loan.findAll({
				where: { 
					id: {
						[Op.in]: uniqueLoanIds
					}
				},
				transaction
			});

			for (const loanId of uniqueLoanIds) {
				const loan = loans.find(loan => loan.id === loanId);
				if (!loan) throw new Error(`Loan ID ${loanId} not found!`)
			}

			// Update each loan and save the change within the transaction
			for (const loan of loans) {
				loan.expectedReturnDate = newReturnDate;
				await loan.save({ transaction });
			}

			await transaction.commit();
            return res.json({ message: 'All dates extended successfully.' });
        } catch (error) {
            await transaction.rollback();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new StatController();