import { v4 as uuidv4 } from 'uuid';

export const createNewType = (type={}) => ({
  'key': uuidv4(),
  'typeId': type.typeId || '',
  'typeName': type.typeName || '',
  'subTypes': (type.subTypes || [{}]).map(subType => createNewSubType(subType))
})

export const createNewSubType = (subType={}) => ({
  'key': uuidv4(),
  'subTypeId': subType.subTypeId || '',
  'subTypeName': subType.subTypeName || '',
  'assets': (subType.assets || [{}]).map(asset => createNewAsset(asset)),
})

export const createNewAsset = (asset={}) => ({
  'key': uuidv4(),
  'alias': asset.alias || '',
  'serialNumber': asset.serialNumber || '',
  'vendorId': asset.vendorId || '',
  'vendorName': asset.vendorName || '',
  'cost': asset.cost || '',
  'remarks': asset.remarks || '',
  'addDate': asset.addDate || new Date(),
  'location': asset.location || '',
})