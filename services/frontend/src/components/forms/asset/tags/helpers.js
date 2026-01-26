import { v4 as uuidv4 } from 'uuid';
import { compareStrings } from "../../utils/validation";

export const createNewTag = (tag=null, assets=[]) => ({
    'key': uuidv4(),
    'tagId': tag?.tagId || '',
    'tagName': tag?.tagName || '',
    'assets': assets.length !== 0 ? assets.map(asset => createNewAsset(asset)) : [createNewAsset()]
})

export const createNewAsset = (asset={}) => ({
    'key': uuidv4(),
    'serialNumber': asset.serialNumber || '',
    'assetId': asset.assetId || '',
    'remarks': asset.remarks || '',
    'tagIds': asset.tags?.map(tag => tag.tagId) || [],
})

export const setValuesExcel = async ({
  records,
  tagOptions,
  fetchAstForTagsFunc,
  setAssetOptions,
  reinitializeForm,
  handleError
}) => {
  try {
    const recordsMap = {};
    const snDict = {};

    records.forEach((record) => {
      ['tag', 'serialNumber'].forEach(field => {
			if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
      });

      const { tag, serialNumber, remarks = "" } = record;

      if (!snDict[tag]) snDict[tag] = new Set();
      if (snDict[tag].has(serialNumber)) throw new Error(`Duplicate Serial Number: ${serialNumber}`);
      else snDict[tag].add(serialNumber);

      if (!recordsMap[tag]) recordsMap[tag] = [];
      recordsMap[tag].push({ serialNumber, remarks });
    });

    const tags = [];

		console.log(recordsMap);

    for (const [tagName, assetRows] of Object.entries(recordsMap)) {
      const serialNumbers = snDict[tagName];
      let tagOption = tagOptions.find(option => compareStrings(option.value, tagName));
			console.log(tagOption);
      let response;

      // TODO not sure if can select items before tag or if it will refresh
      if (!tagOption) tagOption = { tagName };
			response = await fetchAstForTagsFunc([...serialNumbers]);

      const newAssetOptions = response.data;
      setAssetOptions(prev => ([...prev, ...newAssetOptions.filter(a => !prev.some(someA => someA.assetId === a.assetId))]));

      const assetObjs = assetRows.map(({ serialNumber, remarks }) => {
        const match = newAssetOptions.find(option => compareStrings(option.value, serialNumber));
        return match ? { ...match, remarks } : { serialNumber, remarks };
      });

      tags.push(createNewTag(tagOption || { tagName }, assetObjs));
    }

		console.log(tags);

    reinitializeForm({ tags });

  } catch (error) {
    handleError(error);
  }
};
