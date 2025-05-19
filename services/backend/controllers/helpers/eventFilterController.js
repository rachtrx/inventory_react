const { Admin } = require("../../models");
const logger = require('../../logging.js');
const { getAllOptions, getAssetFilters } = require("../utils.js");

class EventFilterController {

    constructor() {
        this.userFields = ["deptName", "userTag"]
        this.assetFields = ["typeName", "subTypeName", "assetTag"]
    }

    getAllFilters = async (req, res) => {
        try {
            const assetOptionsDict = Object.fromEntries(
                await Promise.all(
                    this.assetFields.map(async (field) => [field, await getAssetFilters(field)])
                )
            );
            const userOptionsDict = Object.fromEntries(
                await Promise.all(
                    this.assetFields.map(async (field) => [field, await getAssetFilters(field)])
                )
            );
            const meta = [Admin, 'adminName', 'id'];
            const options = await getAllOptions(meta);
            return res.json({...assetOptionsDict, ...userOptionsDict, admin: options})
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = EventFilterController;