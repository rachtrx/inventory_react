const { Dept } = require("../../models");

exports.getDepts = async (req, res) => {
    try {
        const depts = await Dept.findAll({
            order: [['deptName', 'ASC']],
            attributes: ['deptName']
        });
        const deptNames = depts.map(dept => dept.deptName);
        res.json(deptNames)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};