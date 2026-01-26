import { v4 as uuidv4 } from 'uuid';

export const createNewAccessory = (accessory=null) => {
  return {
    'key': uuidv4(),
    'accessoryTypeId': accessory?.accessoryTypeId || "",
    'accessoryName': accessory?.accessoryName || "",
    "stock": accessory?.stock || 0,
    'count': accessory?.count || 0,
    'remarks': ""
  }
}