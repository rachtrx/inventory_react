import { FaArrowLeft, FaArrowRight, FaCalendarCheck, FaMinus, FaMouse, FaPlus, FaTag, FaTrash, FaUserMinus, FaUserPlus } from "react-icons/fa";
import { FormType } from "../../context/ModalProvider";
import { BiLink, BiUnlink } from "react-icons/bi"; // Represents "untagging" well
import { FaPlusMinus } from "react-icons/fa6";  
import { MdAddToQueue, MdRemoveFromQueue } from "react-icons/md";

export const ACTION_TEXT = {
  [FormType.LOAN]: 'Loan',
  [FormType.RELOAN]: 'Reloan',
  [FormType.RETURN]: 'Return',
  [FormType.ADD_ASSET]: 'Add',
  [FormType.DEL_ASSET]: 'Condemn',
  [FormType.TAG_ASSET]: 'Add Tag',
  [FormType.UNTAG_ASSET]: 'Del Tag',
  [FormType.ADD_USER]: 'Add',
  [FormType.DEL_USER]: 'Remove',
  [FormType.TAG_USER]: 'Add Tag',
  [FormType.UNTAG_USER]: 'Del Tag',
  [FormType.UPDATE_ACC]: 'Update',
  [FormType.RESERVE]: 'Reserve',
  // [FormType.RESTORE_ASSET]: 'Restore',
  // [FormType.RESTORE_USER]: 'Restore',
}

export const ICON_MAP = {
  [FormType.LOAN]: <FaArrowRight />,       
  [FormType.RETURN]: <FaArrowLeft />,      
  [FormType.ADD_ASSET]: <MdAddToQueue />,        
  [FormType.DEL_ASSET]: <MdRemoveFromQueue />,       
  [FormType.TAG_ASSET]: <BiLink />,        
  [FormType.UNTAG_ASSET]: <BiUnlink />,    
  [FormType.ADD_USER]: <FaUserPlus />,     
  [FormType.DEL_USER]: <FaUserMinus />,    
  [FormType.TAG_USER]: <BiLink />,         
  [FormType.UNTAG_USER]: <BiUnlink />,
  [FormType.UPDATE_ACC]: <FaPlusMinus />,      
  [FormType.RESERVE]: <FaCalendarCheck />, 
  // [FormType.RESTORE_ASSET]: <FaUndo />, 
  // [FormType.RESTORE_USER]: <FaUndo />,  
};