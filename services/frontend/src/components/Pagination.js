import { ButtonGroup, Flex, IconButton, Select, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useItems } from '../context/ItemsProvider';

export default function PaginationControls() {

  const { itemsPerPage, setItemsPerPage, page, setPage, maxPage, next, prev } = useItems();

  console.log(itemsPerPage);

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
      gap={2}
    >
      {/* Dropdown for selecting items per page */}
      <Select
        width="auto"
        size="sm"
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value))
          setPage(1)
        }}
      >
        {[50, 100, 200, 300, 400, 500].map((count) => (
          <option key={count} value={count}>
            {count} / page
          </option>
        ))}
      </Select>

      {/* Pagination controls */}
      <ButtonGroup variant="outline" spacing={4} alignItems="center">
        <IconButton
          size="sm"
          onClick={prev}
          disabled={page === 1}
          icon={<ChevronLeftIcon />}
        />
        <Text fontSize="sm">Page {page} of {maxPage}</Text>
        <IconButton
          size="sm"
          onClick={next}
          disabled={page === maxPage}
          icon={<ChevronRightIcon />}
        />
      </ButtonGroup>
    </Flex>
  );
}