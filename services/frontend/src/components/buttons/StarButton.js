import { IconButton } from '@chakra-ui/react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { useItems } from '../../context/ItemsProvider';

const StarButton = ({ id, isBookmarked, ...props }) => {
  const { handleUpdate } = useItems();

  const handleClick = async () => {
    const response = await handleUpdate(id, 'bookmarked', isBookmarked ? 0 : 1);
    console.log(response);
  };

  return (
    <IconButton
      aria-label={isBookmarked ? 'Unbookmark' : 'Bookmark'}
      icon={isBookmarked ? <AiFillStar /> : <AiOutlineStar />}
      onClick={handleClick}
      {...props} // Pass any additional props if needed
    />
  );
};

export default StarButton;
