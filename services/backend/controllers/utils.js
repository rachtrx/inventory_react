const logger = require('../logging');
const { Ast, AstType, AstSType, Vendor, Usr, Loan, Sequelize, sequelize, AstTag, UsrTag, AstLoan, Dept } = require('../models');

exports.FormType = {
    ADD_ASSET: 'ADD_ASSET',
    DEL_ASSET: 'DEL_ASSET',
    LOAN: 'LOAN',
    RETURN: 'RETURN',
    ADD_USER: 'ADD_USER',
    DEL_USER: 'DEL_USER',
    RESTORE_ASSET: 'RESTORE_ASSET',
    RESTORE_USER: 'RESTORE_USER',
    UPDATE_ACC: 'UPDATE_ACC',
    LOAN_ACC: 'LOAN_ACC',
    RETURN_ACC: 'RETURN_ACC',
    TAG_ASSET: 'TAG_ASSET',
    UNTAG_ASSET: 'UNTAG_ASSET',
    TAG_USER: 'TAG_USER',
    UNTAG_USER: 'UNTAG_USER',
    RESERVE: 'RESERVE',
}

exports.assetFilters = ['typeName', 'subTypeName', 'vendor', 'assetTag', 'location', 'age']
exports.userFilters = ['deptName', 'assetCount', 'userTag', 'assetCount']

exports.createSelection = (arr, labelField, valueField) => {
    return arr
        .filter(obj => obj[labelField] && obj[valueField])
        .map(obj => ({
            label: obj[labelField], 
            value: obj[valueField],
            [valueField]: obj[valueField]
        }))
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

exports.getAssetFilters = async (field) => {

    let options;
    try {
        if (['typeName', 'subTypeName', 'vendor', 'assetTag'].includes(field)) {
            let meta = null;
            switch(field) {
                case 'typeName':
                    meta = [AstType, 'typeName', 'id'];
                    break;
                case 'subTypeName':
                    meta = [AstSType, 'subTypeName', 'id'];
                    break;
                case 'vendor':
                    meta = [Vendor, 'vendorName', 'id'];
                    break;
                case 'assetTag':
                    meta = [AstTag, 'tagName', 'id'];
                    break;
                default:
                    meta = null;
            }
            logger.info(meta);
            options = await this.getAllOptions(meta);
        } else if (field === 'location') { // no id
            const distinctOptions = await this.getDistinctOptions(Ast, field);
            options = this.createSelection(distinctOptions, field, field);
        } else if (field === 'age') { // no id
            const devicesAgeQuery = `
                SELECT DISTINCT 
                    FLOOR(DATE_PART('day', NOW() - e.event_date) / 365.25) AS age
                FROM "asts" a
                JOIN "events" e ON a.add_event_id = e.id
                ORDER BY FLOOR(DATE_PART('day', NOW() - e.event_date) / 365.25) DESC;
            `;
            const distinctAges = await sequelize.query(devicesAgeQuery, {
                type: Sequelize.QueryTypes.SELECT
            });
            options = this.createSelection(distinctAges, field, field);
            options = options.map(option => ({ 
                ...option, 
                value: String(option.value)
            }));
            
        } else throw new Error()
        return options || []
        
    } catch (error) {
        throw error;
    }
}

exports.getSubTypes = async (typeIds) => {
    try {
        const result = {};

        for (const typeId of typeIds) {
            const options = await AstSType.findAll({
                attributes: ['id', 'subTypeName'],
                where: { assetTypeId: typeId }
            });

            result[typeId] = options.map(option => ({
                value: option.subTypeName, 
                label: option.subTypeName,
                subTypeId: option.id
            }));
        }

        return result;
    } catch (error) {
        throw error;
    }
}

exports.getUserFilters = async (field) => {
    let options;
    try {
        if (['deptName', 'userTag'].includes(field)) {
            let meta = null;
            switch(field) {
                case 'deptName':
                    meta = [Dept, 'deptName', 'id'];
                    break;
                case 'userTag':
                    meta = [UsrTag, 'tagName', 'id'];
                    break;
            }
            logger.info(meta)
            options = await this.getAllOptions(meta)
            
        } else if (field === 'assetCount') {
            const result = await AstLoan.findAll({
                attributes: [
                    [Sequelize.col('"Loan->Usr"."id"'), 'userId'],
                    [Sequelize.fn('COUNT', Sequelize.col('"AstLoan"."id"')), 'assetCount']
                ],
                include: {
                    model: Loan,
                    attributes: [],
                    include: {
                        model: Usr,
                        attributes: [],
                    },
                },
                where: { returnEventId: null },
                group: [
                    '"Loan->Usr"."id"' // Only group by userId
                ],
                raw: true
            });
            const counts = result.map(item => item.assetCount);
            const distinctCounts = [...new Set(counts)];
            options = distinctCounts.map((count) => ({
                label: count,
                value: count,
            }))
        }
        // console.log(options);
        return options || [];
    } catch (error) {
        throw error;
    }
}
