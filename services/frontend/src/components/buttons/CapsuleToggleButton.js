import React from 'react';
import { ChakraProvider, Box, Button, Flex, IconButton, useColorMode } from '@chakra-ui/react';
import { FaThLarge, FaList } from 'react-icons/fa';

export default function CapsuleToggleButton({ isGridView, setIsGridView }) {
  return (
    <Box
			display="flex"
			flexShrink={0}
			borderWidth="1px"
			borderRadius="full"
			boxSizing="border-box"
			overflow="hidden"
			width={{ base: "60px", sm: "80px" }} // Ensure it doesn't shrink below this size
			height={{ base: "24px", sm: "32px" }}
			alignSelf="center"
		>
			<Button
				aria-label="Grid View"
				height="100%"
				minWidth="50%"
				flex="1"
				p="0"
				borderRadius="0"
				borderRightWidth="1px"
				borderColor="gray.200"
				bg={isGridView ? "black" : "white"}
				color={isGridView ? "white" : "black"}
				_hover={{ bg: isGridView ? "blue.600" : "gray.100" }}
				onClick={() => setIsGridView(true)}
				fontSize={{ base: "10px", sm: "12px" }}
			>
				<FaThLarge mr={2} size="1em" /> {/* When em is used for dimensions like size, it bases its calculation on the fontSize of its parent element. So 1em would mean the size is the same as the fontSize of the element where the icon is placed. */}
			</Button>
			<Button
				aria-label="List View"
				height="100%"
				minWidth="50%"
				flex="1"
				p="0"
				borderRadius="0"
				bg={!isGridView ? "black" : "white"}
				color={!isGridView ? "white" : "black"}
				_hover={{ bg: !isGridView ? "blue.600" : "gray.100" }}
				onClick={() => setIsGridView(false)}
				fontSize={{ base: "10px", sm: "12px" }}
			>
				<FaList mr={2} size="1em" />
			</Button>
		</Box>
  );
};
