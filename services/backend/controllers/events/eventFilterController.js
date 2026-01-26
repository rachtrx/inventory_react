const { Admin } = require("@models");
const logger = require('@/utils/logging.js');
const { getAllOptions, getAssetFilters } = require("@/controllers/utils.js");
const BaseController = require("@controllers/baseController.js");

class EventFilterController extends BaseController {

    constructor() {
        super()
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