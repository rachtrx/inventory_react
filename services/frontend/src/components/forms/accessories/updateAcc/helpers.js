import { v4 as uuidv4 } from 'uuid';

export const createNewAccessory = (accessory=null) => {
  return {
    'key': uuidv4(),
      'accessoryTypeId': accessory?.accessoryTypeId || "",
    'accessoryName': accessory?.accessoryName || "",
      'count': 0,
    'remarks': ""
  }
}