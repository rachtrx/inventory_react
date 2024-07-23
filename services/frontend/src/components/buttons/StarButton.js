import { Box } from "@chakra-ui/react"
import { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai"

const StarButton = ({ isBookmarked, onToggle, id, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      cursor="pointer" 
      {...props}
    >
      {isBookmarked || isHovered ? (
        <AiFillStar 
          onClick={(e) => {
            onToggle(id, isBookmarked);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      ) : (
        <AiOutlineStar 
          onClick={(e) => {
            onToggle(id, isBookmarked);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      )}
    </Box>
  );
};

export default StarButton;