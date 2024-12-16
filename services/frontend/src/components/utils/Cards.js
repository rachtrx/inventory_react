import { SimpleGrid } from '@chakra-ui/react';

function Cards({children}) {
    return (
        <SimpleGrid minChildWidth="250px" gap={3} p={3}>
            {children}
        </SimpleGrid>
    );
}

export default Cards