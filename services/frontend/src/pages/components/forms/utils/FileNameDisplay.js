import React from 'react';
import { Flex, Text, IconButton, Tag, TagCloseButton, TagLabel } from '@chakra-ui/react';

const FileNameDisplay = ({ fileName, resetFileInput }) => {
  return (
    <Flex
  align="center"
  bg="green.100"
  borderRadius="md"
  h="32px"
  w="100%"
>
  {fileName ? (
    <Tag
      borderRadius="md"
      variant="solid"
      colorScheme="green"
      w="100%"
      h="32px" // Ensure the Tag height is the same as the Flex container height
      justifyContent="space-between" // This will push the close button to the end
    >
      <TagLabel isTruncated>{fileName}</TagLabel>
      <TagCloseButton onClick={resetFileInput} size="md" />
    </Tag>
  ) : (
    <Flex
      w="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Text color="gray.500" fontSize="md">No File Selected</Text> {/* Change the text color as you see fit */}
    </Flex>
  )}
</Flex>
  );
};

export default FileNameDisplay;