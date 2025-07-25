import { v4 as uuidv4 } from 'uuid';

export const createNewAccessory = (accessory=null) => ({
    'key': uuidv4(),
    'accessoryTypeId': accessory?.accessoryTypeId || '',
    'accessoryName': accessory?.accessoryName || '',
    'count': accessory?.count || 1,
})

export const createNewAsset = (asset) => {
    console.log(asset);
    return { // 1 loan only can have 1 asset
    'key': uuidv4(),
    'assetId': asset?.assetId || '',
    'sTypeId': asset?.subTypeId || '',
    'serialNumber': asset?.serialNumber || '',
    'onLoan': asset?.astLoans?.length > 0 ? true : false,
    'location': asset?.location || ''
}}

export const createNewLoan = ({
    asset=null,
    accessories=[],
    expectedReturnDate=null,
    remarks=null
} = {}) => ({
    'key': uuidv4(),
    'valid': null, // ensure at least 1 item
    'asset': asset === null ? null : createNewAsset(asset),
    'accessories': accessories.length > 0 ? accessories.map(acc => createNewAccessory(acc)) : [],
    'expectedReturnDate': expectedReturnDate || '',
    'remarks': remarks || '',
})

export const createNewUser = (
    user={}
) => ({
    'key': uuidv4(),
    'userId': user.userId || user.userId || '',
    'userName': user.userName || '',
    'loans': user.loans?.length > 0 ? user.loans.map(loan => createNewLoan(loan)) : [createNewLoan()],
    'signature': ""
})