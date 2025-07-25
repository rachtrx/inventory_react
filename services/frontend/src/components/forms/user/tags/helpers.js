import { v4 as uuidv4 } from 'uuid';

export const createNewTag = (tag=null, users=[]) => ({
    'key': uuidv4(),
    'tagId': tag?.tagId || '',
    'tagName': tag?.tagName || '',
    'users': users.length !== 0 ? users.map(user => createNewUser(user)) : []
})

export const createNewUser = (user={}) => ({
    'key': uuidv4(),
    'userName': user.userName || '',
    'userId': user.userId || '',
  'remarks': user.remarks || '',
    'userTagId': user.tags?.find(tag => tag.isMatching)?.userTagId || '',
})