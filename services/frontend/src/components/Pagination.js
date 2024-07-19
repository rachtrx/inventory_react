import React from 'react';
import { Button, ButtonGroup, Flex, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

export default function PaginationControls({ currentPage, maxPage, next, prev }) {
  return (
    <Flex align="center" justify="center" m={4}>
      <ButtonGroup variant="outline" spacing={4}>
        <Button onClick={prev} disabled={currentPage === 1} leftIcon={<ChevronLeftIcon />}>
          Prev
        </Button>
        <Text>Page {currentPage} of {maxPage}</Text>
        <Button onClick={next} disabled={currentPage === maxPage} rightIcon={<ChevronRightIcon />}>
          Next
        </Button>
      </ButtonGroup>
    </Flex>
  );
}