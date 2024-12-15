const { Ast, AccType, Usr, AccLoan, Loan, sequelize, AstSTypeAcc, AstTypeAcc, AstSType, AstType } = require('../models');

class SearchController {

    async searchVariants (req, res) {
        const data = req.body;
        const subTypeName = '%' + data + '%';
        try {
            const results = await AstSType.findAll({
                include: [{
                    model: AstType,
                    required: true,
                    attributes: ['typeName'],
                }],
                where: {
                    subTypeName: {
                        [sequelize.Op.iLike]: subTypeName
                    }
                },
                order: [
                    ['createdAt', 'ASC']
                ],
                limit: 20,
                attributes: ['id', 'subTypeName']
            });
            console.log(results);
            const models = results.map(result => result.get({ plain: true }));
            res.json(models);
        } catch (error) {
            console.error('Error fetching models:', error);
            res.status(500).send('Internal Server Error');
        }
    };
    
    async searchUser (req, res) {
        const { assetId } = req.body;
        try {
            const user = await Usr.findAll({
                include: [{
                    model: Ast,
                    required: true,
                    attributes: ['id'],
                    where: { id: assetId }
                }, {
                    model: Dept,
                    required: true,
                    attributes: ['deptName']
                }],
                attributes: ['id', 'userName']
            });
            const event = await Event.findOne({
                where: {
                    eventType: 'loaned',
                    assetId: assetId
                },
                order: [
                    ['eventDate', 'DESC']
                ],
                attributes: ['id', 'filePath']
            });
            const response = {
                user: user.map(u => u.get({ plain: true })),
                event: event ? event.get({ plain: true }) : {}
            };
            res.json(response);
        } catch (error) {
            console.error('Error fetching user and event:', error);
            res.status(500).send('Internal Server Error');
        }
    };
}

module.exports = new SearchController();