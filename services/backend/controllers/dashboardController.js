const { Sequelize, Ast, AstType, AstSType, Loan, AstLoan, Usr, Dept, sequelize, Event, AstReturn, UsrDelete } = require('../models');
const { Op } = require('sequelize');
const { Chart, OneToOneChart, ManyToManyChart } = require('./chartDataController.js');
const logger = require('../logging.js');
const { successfulEventCondition, pendingOrCancelledEventCondition } = require('./utils.js');

class DashboardController {

	constructor() {
        this.prepareChartData = this.prepareChartData.bind(this);
        this.dashboard = this.dashboard.bind(this);
    }

	// async getReminders() {
	// 	try {
	// 		const reminders = await Loan.findAll({
	// 			attributes: ['expectedLoanDate', 'expectedReturnDate']
	// 		})
	// 	} catch(error) {
	// 		logger.error(error)
	// 		next(error)
	// 	}
	// }

	// async setReminders() {
	// 	try {

	// 	} catch(error) {
	// 		logger.error(error)
	// 		next(error)
	// 	}
	// }

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
					include: [
						{
							model: Event,
							where: successfulEventCondition()
						},
						{
							model: AstDelete,
							include: {
								model: Event,
								where: pendingOrCancelledEventCondition(),
								required: false,
							},
							required: false
						}
					]
				}],
				group: ['label'],  // Group by the type_name of the AstType model, TODO need to group by asset not?
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
						include: [
							{
								model: Event,
								as: "AddEvent",
								where: successfulEventCondition()
							},
							{
								model: AstDelete,
								include: {
									model: Event,
									where: pendingOrCancelledEventCondition(),
									required: false,
								},
								required: false
							}
						]
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
						WHEN "AstLoans->Loan->Event"."closed_date" IS NOT NULL AND "AstLoans->AstReturns->Event"."closed_date" IS NULL THEN 'Unavailable'
						WHEN "AstLoans->Loan->Event"."opened_date" IS NOT NULL THEN 'Reserved' 
						ELSE 'Available' 
					END`), 'label'],
					[Sequelize.fn('COUNT', Sequelize.col('*')), 'data']
				],
				include: [
					{
						model: Event,
						as: "AddEvent",
						where: successfulEventCondition()
					},
					{
						model: AstDelete,
						include: {
							model: Event,
							where: pendingOrCancelledEventCondition(),
							required: false,
						},
						required: false
					},
					{
						model: AstLoan,
						attributes: [],
						include: [
							{
								model: Loan,
								include: {
									model: Event, // loan event
									where: { cancelled: { [Op.eq]: false } }
								}
							},
							{
								model: AstReturn, // asset return events
								include: {
									model: Event,
									where: successfulEventCondition()
								},
								required: false
							}
						],
						required: false
					}
				],
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
				include: [
					{
						model: Dept,
						attributes: []
					},
					{
						model: Event,
						as: "AddEvent",
						where: successfulEventCondition()
					},
					{
						model: UsrDelete,
						include: {
							model: Event,
							where: pendingOrCancelledEventCondition(),
							required: false,
						},
						required: false
					}
				],
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
				include: [ // Add and Del confitions may not be necessary since only added and uncondemned assets should be on loan 
					{
						model: Event,
						as: "AddEvent",
						where: successfulEventCondition()
					},
					{
						model: UsrDelete,
						include: {
							model: Event,
							where: pendingOrCancelledEventCondition(),
							required: false,
						},
						required: false
					},
					{
						model: Dept,
						attributes: []
					},
					{
						model: Loan,
                        attributes: [],
						include: [
							{
								model: Event,
								where: successfulEventCondition()
							},
							{
								model: AstLoan,
								attributes: [],
								include: [
									
									{
										model: AstReturn,
										include: {
											model: Event,
											where: pendingOrCancelledEventCondition()
										},
										required: false
									}
								],
							}
						],
					}
				],
				group: 'label',
				order: [[Sequelize.fn('COUNT', Sequelize.col('Dept.dept_name')), 'ASC']],
				raw: true
			});

			logger.info(usersLoan)
			
			// Age of assets
			const devicesAge = await Ast.findAll({
				attributes: [
				  [Sequelize.literal(`FLOOR(DATE_PART('day', NOW() - "AddEvent"."closed_date") / 365.25)`), 'label'],
				  [Sequelize.fn('COUNT', Sequelize.col('*')), 'data']
				],
				include: [
					{
						model: Event,
						as: "AddEvent",
						where: successfulEventCondition()
					},
					{
						model: AstDelete,
						include: {
							model: Event,
							where: pendingOrCancelledEventCondition(),
							required: false,
						},
						required: false
					}
				],
				group: [Sequelize.literal(`FLOOR(DATE_PART('day', NOW() - "AddEvent"."closed_date") / 365.25)`)],
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
						include: [
							{
								model: Event,
								as: "AddEvent",
								where: successfulEventCondition()
							},
							{
								model: AstDelete,
								include: {
									model: Event,
									where: pendingOrCancelledEventCondition(),
									required: false,
								},
								required: false
							}
						]
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
						include: [
							{
								model: Event,
								as: "AddEvent",
								where: successfulEventCondition()
							},
							{
								model: AstDelete,
								include: {
									model: Event,
									where: pendingOrCancelledEventCondition(),
									required: false,
								},
								required: false
							}
						],
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
						model: Event,
						as: "AddEvent",
						where: successfulEventCondition()
					},
					{
						model: AstDelete,
						include: {
							model: Event,
							where: pendingOrCancelledEventCondition(),
							required: false,
						},
						required: false
					},
					{
						model: AstSType,
						attributes: [],
						include: {
							model: AstType,
							attributes: []
						}
					}
				],
				group: ['group', '"AstSType->AstType"."type_name"'],
				order: [['group', 'ASC'], ['label', 'ASC']],
				raw: true
			});
	
			logger.info(costPerYearByAsset);
	
			
			const chartDataInputs = [
				{
					'data': topDevicesByCount,
					'agg': (chart) => chart.sumValue(),
					'methods': [(chart) => chart.reduceDataSize()]
				},
				{
					'data': topDevicesByValue,
					'agg': (chart) => chart.sumValue(),
					'isCurrency': true,
					'methods': [(chart) => chart.reduceDataSize()]
				},
				{
					'data': assetStatus,
					'agg': (chart) => chart.pctValue(['loaned']),
					'methods': [(chart) => chart.reduceDataSize()]
				},
				{
					'data': users,
					'agg': (chart) => chart.sumValue(),
					'methods': [(chart) => chart.reduceDataSize()]
				},
				{
					'data': usersLoan,
					'agg': (chart) => chart.sumValue(),
					'methods': [(chart) => chart.reduceDataSize()]
				},
				{
					'data': devicesAge,
					'agg': (chart) => chart.avgValue(),
					'methods': [
						(chart) => chart.addSuffixToLabels(' years'),
						(chart) => chart.reduceDataSize()
					]
				},
				{
					'data': topVariantsByCount,
					'chartType': OneToOneChart,
					'methods': [(chart) => chart.generateData()]
				},
				{
					'data': topVariantsByValue,
					'chartType': OneToOneChart,
					'isCurrency': true,
					'methods': [(chart) => chart.generateData()]
				},
				{
					'data': costPerYearByAsset,
					'chartType': ManyToManyChart,
					'isCurrency': true,
					'methods': [
						(chart) => chart.generateData(),
						(chart) => chart.aggregateDataByGroup(),
						(chart) => chart.mapYearToTotalCost()
					]
				}
	
			];
	
			const chartNames = [
				'topDevicesByCount', 'topDevicesByValue', 'assetStatus',
				'users', 'usersLoan', 'devicesAge', 'topVariantsByCount', 
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
	
		const { data = null, agg = null, chartType = Chart, isCurrency = false, methods = [] } = pipeline;
		const chart = new chartType(data, isCurrency);
		let aggData = null;
	
		if (agg) {
			aggData = agg(chart);
		}
	
		if (methods.length > 0) {
			for (let method of methods) method(chart);
		}
	
		return {
			'data': chart.getData(),
			...(aggData ? { 'agg': aggData } : {}),
			'isCurrency': chart.isCurrency,
			'chartShape': chart.chartShape
		};
	}
}

module.exports = new DashboardController();