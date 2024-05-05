import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Select,
    Heading,
    Grid,
    GridItem
  } from '@chakra-ui/react';

export default function Headers({header}) {
    return (
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading as="h1" size="xl">{header}</Heading>
            <Button colorScheme="blue">Export to Excel</Button>
        </Flex>
    )
}