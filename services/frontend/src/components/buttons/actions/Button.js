import { Box, IconButton, Text } from '@chakra-ui/react';

export const DefaultButton = ({ onClick, bg, text, isMulti, textSize, ...rest }) => (
	<Box
		as="button"
		onClick={onClick}
		bg={bg}
		borderRadius="md"
		p={2}
		{...rest}
	>
	  	<Text fontSize={textSize}>{text}{isMulti && " All"}</Text>
	</Box>
);

export const CircleButton = ({ onClick, bg, text, icon, isMulti, textSize = "xs", size = "md", ...rest }) => (
	<IconButton
	  onClick={onClick}
	  bg={bg}
	  boxShadow="md"
	  transition="all 0.2s ease-in-out"
	  _hover={{ 
		boxShadow: "lg", 
		transform: "scale(1.02)", 
		bg: `${bg.split(".")[0]}.200`, 
		cursor: "pointer" 
	  }}
	  _active={{ 
		boxShadow: "xl", 
		transform: "scale(0.98)", 
		bg: `${bg.split(".")[0]}.250` 
	  }}
		icon={icon}
	  aria-label={text}
	  isRound
	  size={size}
	  {...rest}
	/>
);
  