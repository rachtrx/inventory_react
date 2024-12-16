import React, { useState } from 'react';
import { Field as ChakraField, Button } from '@chakra-ui/react';

const BookmarkFilter = () => {
    const [isOn, setIsOn] = useState(false);
    const toggleBookmark = () => setIsOn(!isOn);
  
    return (
      <ChakraField id="bookmark-filter" label="Bookmarks">
        <Button 
          onClick={toggleBookmark} 
          backgroundColor={isOn ? 'blue.500' : 'gray.200'}
          color={isOn ? 'white' : 'black'}
          _hover={{
            backgroundColor: isOn ? 'blue.600' : 'gray.300',
          }}
          width="100%"
        >
          { isOn ? "Hide" : "Show" }
        </Button>
      </ChakraField>
    );
  };

  export default BookmarkFilter;