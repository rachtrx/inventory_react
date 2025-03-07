const { Op } = require('sequelize');
const { Ast, Admin, Rmk, AstType, AstSType, Vendor, Usr, Loan, 
    Sequelize, sequelize, AccReturn, Event, AstReturn, AstDelete, UsrDelete } = require('../models');

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

exports.downloadEvent = async (req, res) => {
    const id = req.body.id;

    try {
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).send('File not found.');
        }

        const filePath = path.join(uploadPath, event.filePath);
        // console.log(filePath);

        res.download(filePath, event.filePath, { headers: { 'Content-Type': 'application/pdf' } });
    } catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).send('Internal Server Error');
    }
};

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

// IMPT can have multiple
exports.accessoryReturnedQuery = () => ({
    model: AccReturn,
    include: {
        model: Event,
        attributes: ['id', 'openedAdminId', 'openedDate', 'expectedCloseDate', 'closedAdminId', 'closedDate'],
        where: { [Op.and]: [
            {cancelled: { [Op.eq]: false }},
            {closedDate: { [Op.ne]: null }}
        ] }
    },
    required: false
})

// IMPT can only have 1
exports.assetReturnedQuery = () => ({
    model: AstReturn,
    include: {
        model: Event,
        attributes: ['id', 'cancelled', 'openedAdminId', 'openedDate', 'expectedCloseDate', 'closedAdminId', 'closedDate'],
        where: { [Op.and]: [
            {cancelled: { [Op.eq]: false }},
            {closedDate: { [Op.ne]: null }}
        ] }
    },
    required: false
})

exports.assetDeletedQuery = () => ({
    model: AstDelete,
    include: {
        model: Event,
        attributes: ['id', 'cancelled', 'openedAdminId', 'openedDate', 'expectedCloseDate', 'closedAdminId', 'closedDate'],
        where: { [Op.and]: [
            {cancelled: { [Op.eq]: false }},
            {closedDate: { [Op.ne]: null }}
        ] }
    },
    required: false
})

exports.userDeletedQuery = () => ({
    model: UsrDelete,
    include: {
        model: Event,
        attributes: ['id', 'openedAdminId', 'openedDate', 'expectedCloseDate', 'closedAdminId', 'closedDate'],
        where: { [Op.and]: [
            {cancelled: { [Op.eq]: false }},
            {closedDate: { [Op.ne]: null }}
        ] }
    },
    required: false
})

exports.getFullEventDetails = () => ({
    model: Event,
    attributes: ['id', 'openedDate', 'expectedCloseDate', 'closedDate', 'cancelled'],
    required: false,
    include: [
        {
            model: Admin,
            as: "OpenedAdmin",
            attributes: ['id', 'adminName']
        },
        {
            model: Admin,
            as: "ClosedAdmin",
            attributes: ['id', 'adminName'],
            required: false
        },
        {
            model: Rmk,
            attributes: ['id', 'text', 'remarkDate'],
            include: {
                model: Admin,
                attributes: ['id', 'adminName'],
                required: false
            }
        }
    ]
})

exports.successfulEventCondition = () => ({
    [Op.and]: [
        { cancelled: { [Op.eq]: false } },
        { closedDate: { [Op.ne]: null } }
    ]
})

exports.pendingOrCancelledEventCondition = () => ({
    [Op.or]: [
        { closedDate: { [Op.eq]: null } },
        { cancelled: { [Op.eq]: true } },
    ]
})
