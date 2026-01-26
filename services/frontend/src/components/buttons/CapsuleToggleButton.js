import { Box, Button } from '@chakra-ui/react';
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
			width={{ base: "60px", sm: "80px" }}
			height={{ base: "24px", sm: "32px" }}
			alignSelf="center"
		>
			<Button
				aria-label="List View"
				height="100%"
				minWidth="50%"
				flex="1"
				p="0"
				borderRadius="0"
				bg={!isGridView ? "bgSubtle" : "bgGray"}
				color={!isGridView ? "bgGray" : "bgSubtle"}
				onClick={() => setIsGridView(false)}
				fontSize="sm"
			>
				<FaList />
			</Button>
			<Button
				aria-label="Grid View"
				height="100%"
				minWidth="50%"
				flex="1"
				p="0"
				borderRadius="0"
				bg={isGridView ? "bgSubtle" : "bgGray"}
				color={isGridView ? "bgGray" : "bgSubtle"}
				onClick={() => setIsGridView(true)}
				fontSize="sm"
			>
				<FaThLarge /> {/* When em is used for dimensions like size, it bases its calculation on the fontSize of its parent element. So 1em would mean the size is the same as the fontSize of the element where the icon is placed. */}
			</Button>
		</Box>
  );
};
