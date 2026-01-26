exports.MIN_15 = 15 * 60 * 1000
exports.DAYS_30 = 30 * 24 * 60 * 60 * 1000

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
