import React from 'react';
import { Button, Group, Flex, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function PaginationControls({ currentPage, maxPage, next, prev }) {
  return (
    <Flex align="center" justify="center" m={4}>
      <Group>
        <Button onClick={prev} disabled={currentPage === 1} leftIcon={<FiChevronLeft />}>
          Prev
        </Button>
        <Text>Page {currentPage} of {maxPage}</Text>
        <Button onClick={next} disabled={currentPage === maxPage} rightIcon={<FiChevronRight />}>
          Next
        </Button>
      </Group>
    </Flex>
  );
}