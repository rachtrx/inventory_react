const { Sequelize, Asset, AssetType, AssetTypeVariant, Loan, AssetLoan, User, Department, sequelize } = require('../models/postgres');
const { Op } = require('sequelize')
const { Chart, OneToOneChart, ManyToManyChart } = require('./chartDataController')

exports.dashboard = async(req, res, next) => {
	try {
		// Top devices
		const topDevicesByCount = await AssetTypeVariant.findAll({
			attributes: [
				[Sequelize.col('AssetType.asset_type'), 'label'],  // Explicitly name the attribute as used in the GROUP BY and ORDER BY
				[Sequelize.fn('COUNT', Sequelize.col('AssetType.asset_type')), 'data'] // Count the asset types
			],
			include: [{
				model: AssetType,
				attributes: [],  // Include only the 'asset_type' from AssetType
			},{
				model: Asset,
				attributes: [],  // Include only the 'asset_type' from AssetType
				where: {
					deletedDate: { [Op.eq]: null }
				},
			}],
			// where: {
			// 	'$Assets.status$': { [Op.ne]: 'condemned' }  // Accessing status from the associated Asset model
			// },
			group: ['label'],  // Group by the asset_type of the AssetType model
			order: [[Sequelize.fn('COUNT', Sequelize.col('AssetType.asset_type')), 'DESC']],  // Order by the count of asset types
			raw: true,
			subQuery: false  // May help in certain complex grouping scenarios
		});
		
		// Top Asset Types by Value
		const topDevicesByValue = await AssetTypeVariant.findAll({
			attributes: [
				[Sequelize.col('AssetType.asset_type'), 'label'],
				[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Assets.value'), 'FLOAT')), 'data']
			],
			include: [
				{
					model: Asset,
					attributes: [],
					where: {
						deletedDate: { [Op.eq]: null }
					},
					// required: true  // Ensures an inner join, excluding AssetTypeVariants without valid Assets
				},
				{
					model: AssetType,
					attributes: []  // Including 'id' as you want to group by it
				}
			],
			group: ['label'],  // Group by assetType and id from AssetType
			having: Sequelize.where(Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Assets.value'), 'FLOAT')), '!=', 0),
			order: [[Sequelize.fn('SUM', Sequelize.cast(Sequelize.col('Assets.value'), 'FLOAT')), 'DESC']],
			raw: true
		});
			
		const sql = `
			SELECT 
			COUNT(assets.id) AS "data",
			CASE 
				WHEN loans.status = 'COMPLETED' THEN 'Unavailable' 
				WHEN loans.status = 'RESERVED' THEN 'Reserved' 
				WHEN loans.status IS NULL THEN 'Available' 
				ELSE 'UNKNOWN'
			END AS "label"
			FROM assets
			LEFT JOIN asset_loans ON assets.id = asset_loans.asset_id
			LEFT JOIN loans ON asset_loans.event_id = loans.event_id
			WHERE assets.deleted_date IS NULL
			GROUP BY "label";
		`;

		const devicesStatus = await sequelize.query(sql, {
			type: sequelize.QueryTypes.SELECT
		});

		// Users by department
		const users = await User.findAll({
			attributes: [
				[Sequelize.col('Department.dept_name'), 'label'],
				[Sequelize.fn('COUNT', Sequelize.col('Department.dept_name')), 'data']
			],
			include: [{
				model: Department,
				attributes: []
			}],
			where: {
				deletedDate: {
					[Op.eq]: null
				}
			},
			group: 'label',
			order: [[Sequelize.fn('COUNT', Sequelize.col('Department.dept_name')), 'ASC']],
			raw: true
		});

		const usersLoanSQL = `
			SELECT 
				depts.dept_name AS "label", 
				COUNT(asset_loans.asset_id) AS "data"
			FROM users
			LEFT OUTER JOIN depts ON users.dept_id = depts.id
			INNER JOIN loans ON users.id = loans.user_id AND loans.status = 'COMPLETED'
			INNER JOIN asset_loans ON loans.event_id = asset_loans.event_id
			WHERE users.deleted_date IS NULL
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
		FROM "assets"
		WHERE "deleted_date" IS NULL
		GROUP BY FLOOR(DATE_PART('day', NOW() - added_date) / 365.25)
		ORDER BY label DESC;
		`;
		const devicesAge = await sequelize.query(devicesAgeQuery, {
			type: Sequelize.QueryTypes.SELECT
		});

		// Top Models
		const topVariantsByCount = await AssetTypeVariant.findAll({
			attributes: [
					['variant_name', 'label'],
					[Sequelize.fn('COUNT', Sequelize.col('variant_name')), 'data'],
					[Sequelize.col('AssetType.asset_type'), 'group']
			],
			include: [{
					model: Asset,
					attributes: [],  // No attributes are needed from the Asset model directly
					where: {
						deletedDate: { [Op.eq]: null }
					},
			}, {
					model: AssetType,
					attributes: []  // Including AssetType but not selecting attributes directly here, used in the top-level attributes instead
			}],
			group: ['group', 'label'], // TODO check...
			order: [['data', 'DESC']],
			raw: true
		});

		const topVariantsByValue = await AssetTypeVariant.findAll({
			attributes: [
					['variant_name', 'label'],  
					[Sequelize.fn('SUM', Sequelize.col('Assets.value')), 'data'],
					[Sequelize.col('AssetType.asset_type'), 'group']
			],
			include: [{
					model: Asset,
					as: 'Assets',
					attributes: [],
					where: {
						deletedDate: { [Op.eq]: null }
					},
					where: {
						value: { [Op.ne]: 0 }
					}
			}, {
					model: AssetType,
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
			asset_types.asset_type as label
			FROM assets
			JOIN asset_type_variants ON assets.variant_id = asset_type_variants.id
			JOIN asset_types ON asset_type_variants.asset_type_id = asset_types.id
			WHERE deleted_date IS NULL
			GROUP BY added_date, asset_types.asset_type
			ORDER BY added_date ASC, asset_types.asset_type ASC
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
	
		const charts = chartDataInputs.map((data) => prepareChartData(data));
	
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

function prepareChartData(pipeline) {
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