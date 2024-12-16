import React from 'react';
import { Flex, Text, TagRoot, TagLabel, TagCloseTrigger } from '@chakra-ui/react';

const FileNameDisplay = ({ fileName, resetFileInput }) => {
  return (
    <Flex
      align="center"
      bg="blue.100"
      borderRadius="md"
      h="32px"
      w="100%"
    >
      {fileName ? (
        <TagRoot asChild
          borderRadius="md"
          variant="solid"
          colorPalette="blue"
          w="100%"
          h="32px" // Ensure the Tag height is the same as the Flex container height
          justifyContent="space-between" // This will push the close button to the end
          closable
        >
          <TagLabel isTruncated>{fileName}</TagLabel>
          <TagCloseTrigger onClick={resetFileInput} size="md" />
        </TagRoot>
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