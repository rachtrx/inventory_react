import { SimpleGrid } from '@chakra-ui/react';

function Cards({children}) {
    return (
        <SimpleGrid minChildWidth="250px" spacing="16px">
            {children}
        </SimpleGrid>
    );
}

export default Cards