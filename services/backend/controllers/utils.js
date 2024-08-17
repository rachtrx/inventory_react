<<<<<<< HEAD
const { Asset, AssetType, AssetTypeVariant, Vendor, User, Loan, Sequelize, sequelize} = require('../models/postgres');

exports.formTypes = {
=======
const formTypes = {
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
    ADD_ASSET: 'ADD_ASSET',
    DEL_ASSET: 'DEL_ASSET',
    LOAN: 'LOAN',
    RETURN: 'RETURN',
    ADD_USER: 'ADD_USER',
    DEL_USER: 'DEL_USER',
<<<<<<< HEAD
    ADD_PERIPHERAL: 'ADD_PERIPHERAL',
    RESERVE: 'RESERVE',
}

exports.formToEventMap = {
    [this.formTypes.ADD_ASSET]: 'ADD',
    [this.formTypes.DEL_ASSET]: 'DEL',
    [this.formTypes.LOAN]: 'LOAN',
    [this.formTypes.RETURN]: 'RETURN',
    [this.formTypes.ADD_USER]: 'ADD',
    [this.formTypes.DEL_USER]: 'DEL',
    [this.formTypes.ADD_PERIPHERAL]: 'ADD',
    [this.formTypes.TAG]: 'TAG',
    [this.formTypes.UNTAG]: 'UNTAG',
}

exports.createSelection = (arr, labelField, valueField) => {
    return arr
        .filter(obj => obj[labelField] && obj[valueField])
        .map(obj => ({label: obj[labelField], value: obj[valueField]}))
}

exports.getAllOptions = async (meta) => {
    try {
        const [table, valueField, labelField] = meta;
        const options = await table.findAll({
            attributes: [
                labelField,
                valueField,
            ]
        });
        return this.createSelection(options, labelField, valueField);
    } catch (error) {
        throw error;
    }
}

exports.getDistinctOptions = async (table, field) => {
    // Create the attributes array dynamically
    const attributes = [Sequelize.fn('DISTINCT', Sequelize.col(field)), field];

    // Execute the query
    const options = await table.findAll({
        attributes: attributes,
    });

    return options;
=======
}

const formToEventMap = {
    [formTypes.ADD_ASSET]: 'ADD',
    [formTypes.DEL_ASSET]: 'DEL',
    [formTypes.LOAN]: 'LOAN',
    [formTypes.RETURN]: 'RETURN',
    [formTypes.ADD_USER]: 'ADD',
    [formTypes.DEL_USER]: 'DEL',
>>>>>>> 9b17626fe53b63ae33f8eb07085e5647a25f7a98
}