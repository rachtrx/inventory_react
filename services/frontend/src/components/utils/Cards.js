import { SimpleGrid } from '@chakra-ui/react';

function Cards({children}) {
    return (
        <SimpleGrid minChildWidth="250px" spacing={3} p={3}>
            {children}
        </SimpleGrid>
    );
}

export default Cards