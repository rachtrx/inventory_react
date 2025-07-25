import { v4 as uuidv4 } from 'uuid';

export const delNewAsset = (asset={}) => ({
  'key': uuidv4(),
  'assetId': asset.assetId || '',
  'serialNumber': asset.serialNumber || '', // TODO if we move to serialNumber instead of tag
  'delDate': asset.delDate || new Date(),
  'lastEventDate': asset.lastEventDate || '',
  'remarks': asset.remarks || '',
})