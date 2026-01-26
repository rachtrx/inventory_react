import { v4 as uuidv4 } from 'uuid';
import { compareStrings } from '../../utils/validation';

export const createNewTag = (tag=null, users=[]) => ({
    'key': uuidv4(),
    'tagId': tag?.tagId || '',
    'tagName': tag?.tagName || '',
    'users': users.length !== 0 ? users.map(user => createNewUser(user)) : [createNewUser()]
})

export const createNewUser = (user={}) => ({
    'key': uuidv4(),
    'userName': user.userName || '',
    'userId': user.userId || '',
    'remarks': user.remarks || '',
    'tagIds': user.tags?.map(tag => tag.tagId) || [],
})

export const setValuesExcel = async ({
  records, 
  tagOptions, 
  fetchUsrForTagsFunc, 
  setUserOptions, 
  reinitializeForm,
  handleError
}) => {
  try {
    const recordsMap = {};
    const unDict = {};

    records.forEach((record) => {
      ['tag', 'userName'].forEach((field) => {
        if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
      });

      const { tag, userName, remarks = "" } = record;

      if (!unDict[tag]) unDict[tag] = new Set();

      if (unDict[tag].has(userName)) throw new Error(`Duplicate records for UserName: ${userName} were found`);
      else unDict[tag].add(userName);

      if (!recordsMap[tag]) recordsMap[tag] = [];
      recordsMap[tag].push({ userName, remarks });
    });

    const tags = [];

    for (const [tagName, userRows] of Object.entries(recordsMap)) {
      const userNames = [...unDict[tagName]];
      let tagOption = tagOptions.find((option) => compareStrings(option.value, tagName));
      let response;

      // TODO not sure if can select items before tag or if it will refresh
      if (!tagOption) tagOption = { tagName };
      response = await fetchUsrForTagsFunc([...userNames]);

      const newUserOptions = response.data;
      setUserOptions((prev) => ([...prev, ...newUserOptions.filter(u => !prev.some(someU => someU.userId === u.userId))]));

      const userObjs = userRows.map(({ userName, remarks }) => {
        const match = newUserOptions.find((option) => compareStrings(option.value, userName));
        return match ? { ...match, remarks } : { userName, remarks };
      });

      tags.push(createNewTag(tagOption || { tagName }, userObjs));
    }

    reinitializeForm({ tags });
  } catch (error) {
    handleError(error);
  }
};
