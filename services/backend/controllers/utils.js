const { Ast, AstType, AstSType, Vendor, Usr, Loan, Sequelize, sequelize } = require('../models');

exports.FormType = {
    ADD_ASSET: 'ADD_ASSET',
    DEL_ASSET: 'DEL_ASSET',
    LOAN: 'LOAN',
    RETURN: 'RETURN',
    ADD_USER: 'ADD_USER',
    DEL_USER: 'DEL_USER',
    ADD_PERIPHERAL: 'ADD_PERIPHERAL',
    RESERVE: 'RESERVE',
}

exports.formToEventMap = {
    [this.FormType.ADD_ASSET]: 'ADD',
    [this.FormType.DEL_ASSET]: 'DEL',
    [this.FormType.LOAN]: 'LOAN',
    [this.FormType.RETURN]: 'RETURN',
    [this.FormType.ADD_USER]: 'ADD',
    [this.FormType.DEL_USER]: 'DEL',
    [this.FormType.ADD_PERIPHERAL]: 'ADD',
    [this.FormType.TAG]: 'TAG',
    [this.FormType.UNTAG]: 'UNTAG',
}

exports.createSelection = (arr, labelField, valueField) => {
    return arr
        .filter(obj => obj[labelField] && obj[valueField])
        .map(obj => ({label: obj[labelField], value: obj[valueField]}))
}

exports.getAllOptions = async (meta) => {
    try {
        const [table, labelField, valueField] = meta;
        const options = await table.findAll({
            attributes: [
                valueField,
                labelField,
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
}