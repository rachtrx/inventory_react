const { AccLoanSearch } = require("./accLoan");

class AccLoanByNameSearch extends AccLoanSearch {

    constructor({accessoryNames}) {

        super()
        const names = Array.isArray(accessoryNames)
            ? accessoryNames.map(name => name.toLowerCase())
            : [accessoryNames.toLowerCase()];

        this.accessoryNames = Array.isArray(accessoryNames) ? names : names[0];

        this.accessoryCondition = Array.isArray(accessoryNames)
            ? {
                [Op.or]: names.map(name =>
                    Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('accessory_name')),
                    name
                    )
                )
            } : Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('accessory_name')),
                {
                    [Op.like]: `%${names[0]}%`
                }
            );
    }
}

module.exports = { AccLoanByNameSearch }
