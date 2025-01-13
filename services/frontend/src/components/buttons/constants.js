import { FormType } from "../../context/ModalProvider";

export const ACTION_TEXT = {
  [FormType.LOAN]: 'Loan',
  [FormType.RETURN]: 'Return',
  [FormType.ADD_ASSET]: 'Add',
  [FormType.DEL_ASSET]: 'Condemn',
  [FormType.ADD_USER]: 'Add',
  [FormType.DEL_USER]: 'Remove',
  [FormType.UPDATE_ACC]: 'Update',
  [FormType.LOAN_ACC]: 'Loan',
  [FormType.RETURN_ACC]: 'Return',
  [FormType.RESTORE_ASSET]: 'Restore',
  [FormType.RESTORE_USER]: 'Restore',
}

export const ACTION_COLORS = {
  [FormType.LOAN]: 'blue.100',
  [FormType.RETURN]: 'orange.100',
  [FormType.ADD_ASSET]: 'green.100',
  [FormType.DEL_ASSET]: 'red.100',
  [FormType.ADD_USER]: 'green.100',
  [FormType.DEL_USER]: 'red.100',
  [FormType.UPDATE_ACC]: 'green.100',
  [FormType.LOAN_ACC]: 'purple.100',
  [FormType.RETURN_ACC]: 'pink.100',
  [FormType.RESTORE_ASSET]: 'red.100',
  [FormType.RESTORE_USER]: 'red.100',
}