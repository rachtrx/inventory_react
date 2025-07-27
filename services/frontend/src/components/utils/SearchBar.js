import { Flex, IconButton, Input, InputGroup, InputLeftElement, InputRightElement, Tooltip } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useState, useEffect, useRef } from 'react';
import _ from 'lodash'; // for debounce (optional)
import { useItems } from '../../context/ItemsProvider';
import { MdClear } from "react-icons/md";

export default function SearchBar({ attr, label, resetFlag=null }) {
  const { setSearchFilters } = useItems(); // your function to trigger filtering
  const [query, setQuery] = useState("");
  const skipDebounceRef = useRef(false);

  useEffect(() => {
    if (!resetFlag) return;
    skipDebounceRef.current = true;
    setQuery('');
  }, [resetFlag]);

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }

    const delayed = _.debounce(() => {
      setSearchFilters((oldFilters) => ({
        ...oldFilters,
        [attr]: query
      }));
    }, 300);

    delayed();
    return delayed.cancel;
  }, [attr, query, setSearchFilters]);

  return (
    <InputGroup size="sm" flex="5">
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>

      <Input
        placeholder={`Search ${label}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        borderRadius="md"
        focusBorderColor="blue.400"
        bg="white"
        pr="2.5rem" // make space for the right icon
      />

      {query && (
        <InputRightElement>
          <IconButton
            aria-label="Clear"
            icon={<MdClear />}
            size="xs"
            variant="ghost"
            color="gray.500"
            onClick={() => setQuery('')}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
}
