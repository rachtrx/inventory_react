import { IconButton } from '@chakra-ui/react';
import { MdEdit, MdEditOff } from 'react-icons/md';
import { useEditMode } from '../../context/EditModeProvider';

export const EditToggleButton = (props) => {
  const { editable, setEditable } = useEditMode();

  return (
    <IconButton
      aria-label="Toggle edit mode"
      icon={editable ? <MdEdit /> : <MdEditOff />}
      onClick={() => setEditable(!editable)}
      {...props}
    />
  );
};
