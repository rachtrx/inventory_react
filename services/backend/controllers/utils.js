const formTypes = {
    ADD_ASSET: 'ADD_ASSET',
    DEL_ASSET: 'DEL_ASSET',
    LOAN: 'LOAN',
    RETURN: 'RETURN',
    ADD_USER: 'ADD_USER',
    DEL_USER: 'DEL_USER',
}

const formToEventMap = {
    [formTypes.ADD_ASSET]: 'ADD',
    [formTypes.DEL_ASSET]: 'DEL',
    [formTypes.LOAN]: 'LOAN',
    [formTypes.RETURN]: 'RETURN',
    [formTypes.ADD_USER]: 'ADD',
    [formTypes.DEL_USER]: 'DEL',
}

module.exports = {formTypes}