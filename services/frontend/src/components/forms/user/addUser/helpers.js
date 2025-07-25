import { v4 as uuidv4 } from 'uuid';

export const createNewDept = (dept={}) => ({
  'key': uuidv4(),
  'deptId': dept.deptId || '',
  'deptName': dept.deptName || '',
  'users': (dept.users || [{}]).map(user => createNewUser(user))
})

export const createNewUser = (user={}) => ({
  'key': uuidv4(),
  'userName': user.userName || '',
  'email': user.email || '',
  'addDate': user.addDate || new Date(),
  'remarks': user.remarks || '',
})