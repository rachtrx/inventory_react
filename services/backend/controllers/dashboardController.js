const { Sequelize, Admin, Asset, AssetType, AssetTypeVariant, Vendor, User, Dept, sequelize, Event } = require('../models');
const { Op } = require('sequelize')
const { Chart, OneToOneChart, ManyToManyChart } = require('./chartDataController')
const { getLatestEventIds } = require('./utils')

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
				include: [{
					model: Event,
					attributes: [], 
					where: {
						eventType: { [Op.ne]: 'condemned' }
					},
				}],
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
					include: [{
						model: Event,
						attributes: [], 
						where: {
							eventType: { [Op.ne]: 'condemned' }
						},
					}]
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
		
		async function getDevicesStatus() {
			const latestEventIds = await getLatestEventIds(includeEvents=['loaned', 'registered', 'returned']);
		
			const devicesStatus = await Asset.findAll({
				attributes: [
					[Sequelize.col('Events.event_type'), 'label'],
					[Sequelize.fn('COUNT', Sequelize.col('Asset.id')), 'data']
				],
				include: [{
					model: Event,
					attributes: [],
					where: {
						id: { [Op.in]: latestEventIds }
					}
				}],
				group: ['label'],
				raw: true
			});
		
			return devicesStatus;
		}
		const devicesStatus = await getDevicesStatus()

		// Users by department
		const users = await User.findAll({
			attributes: [
				[Sequelize.col('Dept.dept_name'), 'label'],
				[Sequelize.fn('COUNT', Sequelize.col('Dept.dept_name')), 'data']
			],
			include: [{
				model: Dept,
				attributes: []
			}],
			where: {
				has_resigned: {
					[Op.ne]: 1
				}
			},
			group: 'label',
			order: [[Sequelize.fn('COUNT', Sequelize.col('Dept.dept_name')), 'ASC']],
			raw: true
		});
		
		const usersLoan = await User.findAll({
			attributes: [
				[Sequelize.col('Dept.dept_name'), 'label'],
				[Sequelize.fn('COUNT', Sequelize.col('Assets.id')), 'data']  // Counting assets associated with the users
			],
			include: [{
				model: Dept,
				attributes: [],  // No attributes needed directly, but needed for grouping
			}, {
				model: Asset,
				attributes: [],  // Including Assets to count them, but not fetching any attributes directly
				required: true
			}],
			where: {
				has_resigned: {
					[Op.ne]: 1
				}
			},
			group: ['label'],  // Grouping by department name
			order: [['data', 'ASC']],  // Order by the count of assets
			raw: true
		});
		
		// Age of assets
		const devicesAgeQuery = `SELECT 
			FLOOR(DATE_PART('day', NOW() - registered_date) / 365.25) AS label,
			COUNT(*) AS "data"
		FROM "assets"
		JOIN "events" ON "assets"."last_event_id" = "events"."id"
		WHERE "events"."event_type" != 'condemned'
		GROUP BY FLOOR(DATE_PART('day', NOW() - registered_date) / 365.25)
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
					include: [{
						model: Event,
						attributes: [], 
						where: {
							eventType: { [Op.ne]: 'condemned' }
						},
						// required: true  // Ensures INNER JOIN, meaning only AssetTypeVariants with non-condemned Assets are included
					}]
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
					include: [{
						model: Event,
						attributes: [], 
						where: {
							eventType: { [Op.ne]: 'condemned' }
						},
					}],
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
			EXTRACT(YEAR FROM registered_date) AS group,
			SUM(value) AS data,
			asset_types.asset_type as label
			FROM assets
			JOIN asset_type_variants ON assets.variant_id = asset_type_variants.id
			JOIN asset_types ON asset_type_variants.asset_type_id = asset_types.id
			JOIN "events" ON "assets"."last_event_id" = "events"."id"
			WHERE "events"."event_type" != 'condemned'
			GROUP BY registered_date, asset_types.asset_type
			ORDER BY registered_date ASC, asset_types.asset_type ASC
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