const { Sequelize, Admin, Asset, AssetType, AssetTypeVariant, Vendor, User, Dept, sequelize, Event } = require('../models');
const { Op } = require('sequelize')

async function getLatestEventIds(forUsers=false, includeEvents=null, asset_id=null, user_id=null) {
    const whereCondition = {};
	if (includeEvents) {
		whereCondition.event_type = { [Op.in]: includeEvents };
	}
	if (asset_id) {
		whereCondition.asset_id = asset_id;
	}
	if (user_id) {
		whereCondition.user_id = user_id;
	}

    const events = await Event.findAll({
        attributes: [
            // forUsers ? 'user_id' : 'asset_id',
            [Sequelize.fn('MAX', Sequelize.col('id')), 'max_id']
        ],
        where: whereCondition,
        group: forUsers ? ['user_id'] : ['asset_id'],
        raw: true
    });

    // Map to get only max_id which is the latest event id for each asset
    return events.map(event => event.max_id);
}

module.exports = { getLatestEventIds };