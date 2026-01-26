import { v4 as uuidv4 } from 'uuid';

export const delNewUser = (user={}) => ({
  'key': uuidv4(),
  'userId': user?.userId || '',
  'userName': user?.userName || '',
  'delDate': user?.delDate || new Date(),
  'lastEventDate': user?.lastEventDate || '',
  'remarks': user?.remarks || '',
})
