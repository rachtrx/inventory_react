import { IconButton } from '@chakra-ui/react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { useItems } from '../../context/ItemsProvider';

export const StarButton = ({ isBookmarked, handleUpdate, ...props }) => {

  return (
    <IconButton
      aria-label={isBookmarked ? 'Unbookmark' : 'Bookmark'}
      icon={isBookmarked ? <AiFillStar /> : <AiOutlineStar />}
      onClick={handleUpdate}
      {...props} // Pass any additional props if needed
    />
  );
};

export const ItemStarButton = ({ id, isBookmarked, ...props }) => {
  const { handleUpdate } = useItems();

  const handleClick = async () => {
    const response = await handleUpdate(id, 'bookmarked', isBookmarked ? false : true);
    console.log(response);
  };

  return (
    <StarButton
      isBookmarked={isBookmarked}
      handleUpdate={handleClick}
      {...props}
    />
  );
};

