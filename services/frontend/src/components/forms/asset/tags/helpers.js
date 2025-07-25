import { v4 as uuidv4 } from 'uuid';

export const createNewTag = (tag=null, assets=[]) => ({
    'key': uuidv4(),
    'tagId': tag?.tagId || '',
    'tagName': tag?.tagName || '',
    'assets': assets.length !== 0 ? assets.map(asset => createNewAsset(asset)) : []
})

export const createNewAsset = (asset={}) => ({
    'key': uuidv4(),
    'serialNumber': asset.serialNumber || '',
    'assetId': asset.assetId || '',
    'remarks': asset.remarks || '',
    'assetTagId': asset.tags?.find(tag => tag.isMatching)?.assetTagId || '',
})