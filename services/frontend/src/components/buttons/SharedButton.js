import { IconButton } from '@chakra-ui/react';
import { FaUsers, FaUser } from 'react-icons/fa';
import { useItems } from '../../context/ItemsProvider';

const SharedButton = ({ id, isShared, userCount, ...props }) => {
  const { handleUpdate } = useItems();

  const handleClick = () => {
    if (userCount > 1) return; // Button will already be disabled, but this is a safeguard.
    handleUpdate(id, 'shared', isShared ? 0 : 1);
  };

  return (
    <IconButton
      aria-label={isShared ? "Shared" : "Single"}
      icon={isShared ? <FaUsers /> : <FaUser />}
      onClick={handleClick}
      isDisabled={userCount > 1} // Disable button when userCount > 1
      {...props}
    />
  );
};

export default SharedButton;