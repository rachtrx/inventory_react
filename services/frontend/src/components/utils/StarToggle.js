import { IconButton } from "@chakra-ui/react"
import { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai"

export const StarToggle = ({ isBookmarked, onToggle, id, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <IconButton
      aria-label="Bookmark"
      icon={isBookmarked || isHovered ? <AiFillStar /> : <AiOutlineStar />}
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(id, isBookmarked);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{ bg: 'transparent' }} // Prevent background color change on hover
      {...props}
    />
  );
};

export default StarToggle;