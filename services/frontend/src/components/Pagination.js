import React from 'react';
import { Button, ButtonGroup, Flex, IconButton, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { ResponsiveText } from './utils/ResponsiveText';

export default function PaginationControls({ currentPage, maxPage, next, prev }) {
  return (
    <Flex 
      align="center" 
      justify="center" 
      position="sticky"  // Makes it sticky
      bottom={0}         // Sticks to the bottom
      bg="white"         // Adds background color to prevent overlap issues
      py={2}             // Adds some padding for spacing
      zIndex={2}        // Ensures it stays above other elements
      boxShadow="md"     // Optional: Adds shadow for better visibility
    >
      <ButtonGroup variant="outline" spacing={4} alignItems="center">
        <IconButton onClick={prev} disabled={currentPage === 1} icon={<ChevronLeftIcon />}/>
        <ResponsiveText>Page {currentPage} of {maxPage}</ResponsiveText>
        <IconButton onClick={next} disabled={currentPage === maxPage} icon={<ChevronRightIcon />}/>
      </ButtonGroup>
    </Flex>
  );
}