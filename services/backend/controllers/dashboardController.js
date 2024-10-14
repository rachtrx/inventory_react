const { Sequelize, Ast, AstType, AstSType, Loan, AstLoan, Usr, Dept, sequelize } = require('../models/postgres');
const { Op } = require('sequelize');
const { Chart, OneToOneChart, ManyToManyChart } = require('./chartDataController.js');

class DashboardController {

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
						deletedDate: { [Op.eq]: null }
					},
				}],
				// where: {
				// 	'$Assets.status$': { [Op.ne]: 'condemned' }  // Accessing status from the associated Ast model
				// },
				group: ['label'],  // Group by the type_name of the AstType model
				order: [[Sequelize.fn('COUNT', Sequelize.col('AstType.type_name')), 'DESC']],  // Order by the count of asset types
				raw: true,
				subQuery: false  // May help in certain complex grouping scenarios
			});
			
			// Top Ast Types by Value
			const topDevicesByValue = await AstSType.findAll({
				attributes: [
					[Sequelize.col('AstType.type_name'), 'label'],
					[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Assets.value'), 'FLOAT')), 'data']
				],
				include: [
					{
						model: Ast,
						attributes: [],
						where: {
							deletedDate: { [Op.eq]: null }
						},
						// required: true  // Ensures an inner join, excluding AssetTypeVariants without valid Assets
					},
					{
						model: AstType,
						attributes: []  // Including 'id' as you want to group by it
					}
				],
				group: ['label'],  // Group by typeName and id from AstType
				having: Sequelize.where(Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Assets.value'), 'FLOAT')), '!=', 0),
				order: [[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Assets.value'), 'FLOAT')), 'DESC']],
				raw: true
			});
				
			const sql = `
				SELECT 
				COUNT(asts.id) AS "data",
				CASE 
					WHEN loans.status = 'COMPLETED' THEN 'Unavailable' 
					WHEN loans.status = 'RESERVED' THEN 'Reserved' 
					WHEN loans.status IS NULL THEN 'Available' 
					ELSE 'UNKNOWN'
				END AS "label"
				FROM asts
				LEFT JOIN ast_loans ON asts.id = ast_loans.asset_id
				LEFT JOIN loans ON ast_loans.event_id = loans.event_id
				WHERE asts.deleted_date IS NULL
				GROUP BY "label";
			`;
	
			const devicesStatus = await sequelize.query(sql, {
				type: sequelize.QueryTypes.SELECT
			});
	
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
					deletedDate: {
						[Op.eq]: null
					}
				},
				group: 'label',
				order: [[Sequelize.fn('COUNT', Sequelize.col('Dept.dept_name')), 'ASC']],
				raw: true
			});
	
			const usersLoanSQL = `
				SELECT 
					depts.dept_name AS "label", 
					COUNT(ast_loans.asset_id) AS "data"
				FROM usrs
				LEFT OUTER JOIN depts ON usrs.dept_id = depts.id
				INNER JOIN loans ON usrs.id = loans.user_id AND loans.status = 'COMPLETED'
				INNER JOIN ast_loans ON loans.event_id = ast_loans.event_id
				WHERE usrs.deleted_date IS NULL
				GROUP BY depts.dept_name
				ORDER BY "data" ASC;
			`
	
			const usersLoan = await sequelize.query(usersLoanSQL, {
				type: sequelize.QueryTypes.SELECT
			});
			
			// Age of assets
			const devicesAgeQuery = `SELECT 
				FLOOR(DATE_PART('day', NOW() - added_date) / 365.25) AS label,
				COUNT(*) AS "data"
			FROM asts
			WHERE "deleted_date" IS NULL
			GROUP BY FLOOR(DATE_PART('day', NOW() - added_date) / 365.25)
			ORDER BY label DESC;
			`;
			const devicesAge = await sequelize.query(devicesAgeQuery, {
				type: Sequelize.QueryTypes.SELECT
			});
	
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
							deletedDate: { [Op.eq]: null }
						},
				}, {
						model: AstType,
						attributes: []  // Including AstType but not selecting attributes directly here, used in the top-level attributes instead
				}],
				group: ['group', 'label'], // TODO check...
				order: [['data', 'DESC']],
				raw: true
			});
	
			const topVariantsByValue = await AstSType.findAll({
				attributes: [
						['sub_type_name', 'label'],  
						[Sequelize.fn('SUM', Sequelize.col('Assets.value')), 'data'],
						[Sequelize.col('AstType.type_name'), 'group']
				],
				include: [{
						model: Ast,
						as: 'Assets',
						attributes: [],
						where: {
							deletedDate: { [Op.eq]: null }
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
			
			// Cost per year
			const costPerYearByAssetQuery = `SELECT 
				EXTRACT(YEAR FROM added_date) AS group,
				SUM(value) AS data,
				ast_types.type_name as label
				FROM asts
				JOIN ast_s_types ON asts.sub_type_id = ast_s_types.id
				JOIN ast_types ON ast_s_types.asset_type_id = ast_types.id
				WHERE deleted_date IS NULL
				GROUP BY added_date, ast_types.type_name
				ORDER BY added_date ASC, ast_types.type_name ASC
			`;
			const costPerYearByAsset = await sequelize.query(costPerYearByAssetQuery, {
				type: Sequelize.QueryTypes.SELECT
			});
	
			// console.log(costPerYearByAsset);
	
			
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
					'data': devicesStatus,
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
				'topDevicesByCount', 'topDevicesByValue', 'devicesStatus',
				'users', 'usersLoan', 'devicesAge', 'topVariantsByCount', 
				'topVariantsByValue', 'costPerYearByAsset'
			];
		
			const charts = chartDataInputs.map((data) => this.prepareChartData(data));
		
			const response = charts.reduce((obj, chart, index) => {
				obj[chartNames[index]] = chart;
				return obj;
			}, {});
		
			// Prepare the special charts
		
			console.log(response);
	
			// Send JSON response
			res.json(response);
			
		} catch(error) {
			res.status(500).json({ error: error.message });
			next(error)
		}
	}
	
	prepareChartData(pipeline) {
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