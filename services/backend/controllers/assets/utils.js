const { Vendor, AstType, AstSType, sequelize } = require("../../models");

exports.getAssetTypes = async (req, res) => {
    const assetTypes = await AstType.findAll({
        where: { id: { [Op.not]: null } },
        order: [['typeName', 'ASC']],
        attributes: ['typeName']
    });

    return res.json(assetTypes.map(a => a.typeName));
};

exports.getVendors = async (req, res) => {
    // console.log(`Usr ID: ${req.session.userId}`);
    try {
        const vendors = await Vendor.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('vendorName')), 'vendorName']],
            order: [['vendorName', 'ASC']]
        });
        return res.json(vendors.map(v => v.vendorName));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getAssetSubTypes = async (req, res) => {
    // console.log(`Usr ID: ${req.session.userId}`);
    try {
        const sTypes = await AstSType.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('subTypeName')), 'subTypeName']],
            order: [['subTypeName', 'ASC']]
        });
        return res.json(sTypes.map(subType => subType.subTypeName));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};