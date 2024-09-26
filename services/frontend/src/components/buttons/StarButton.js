import { Box } from "@chakra-ui/react"
import { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai"
import { useItems } from "../../context/ItemsProvider";

const StarButton = ({ isBookmarked, id, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { handleUpdate } = useItems()

  return (
    <Box
      cursor="pointer" 
      {...props}
    >
      {isBookmarked || isHovered ? (
        <AiFillStar 
          onClick={(e) => {
            handleUpdate(id, 'bookmarked', isBookmarked ? 0 : 1);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      ) : (
        <AiOutlineStar 
          onClick={(e) => {
            handleUpdate(id, 'bookmarked', 1);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      )}
    </Box>
  );
};

export default StarButton;