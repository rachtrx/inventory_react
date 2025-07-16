import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import _ from 'lodash'; // for debounce (optional)
import { useItems } from '../../context/ItemsProvider';


export default function SearchBar({ attr, label }) {
  const { setSearchFilters } = useItems(); // your function to trigger filtering
  const [query, setQuery] = useState('');

  // Debounce the search function to avoid spamming
  useEffect(() => {
    const delayed = _.debounce(() => {
      setSearchFilters((oldFilters) => ({
        ...oldFilters,
        [attr]: query
      }))
    }, 300); // 300ms debounce

    delayed();

    // cleanup on unmount
    return delayed.cancel;
  }, [attr, query, setSearchFilters]);

  return (
    <InputGroup size="sm" flex ="5">
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
      />
    </InputGroup>
  );
}
