import React from "react";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Badge,
    Divider,
    Stack,
    Heading,
    Icon,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";

const ReserveEvent = ({ event }) => {
    const { accLoans } = event.reservation;

    return (
        <Box
            p={6}
            bg="gray.50"
            borderRadius="lg"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
            w="100%"
        >
            <Flex direction={{ base: "column", md: "row" }} gap={6}>
                {/* Left Panel: Accessory Details */}
                <Box flex="1">
                    <Heading as="h3" size="md" mb={4} color="blue.600">
                        Accessories Loaned
                    </Heading>
                    <VStack spacing={4} align="stretch">
                        {accLoans && accLoans.length > 0 && accLoans.map((accLoan, index) => (
                            <Box
                                key={index}
                                p={3}
                                bg="white"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.300"
                                boxShadow="sm"
                            >
                                <Flex justify="space-between" align="center">
                                    <Text fontWeight="medium" fontSize="sm">
                                        {accLoan.accessoryName.toUpperCase()}
                                    </Text>
                                    <HStack>
                                        {/* Returned Count */}
                                        <Badge
                                            colorScheme="green"
                                            fontSize="0.8em"
                                            borderRadius="md"
                                        >
                                            <Icon as={CheckCircleIcon} mr={1} />
                                            Returned: {accLoan.returned}
                                        </Badge>
                                        {/* Unreturned Count */}
                                        <Badge
                                            colorScheme="red"
                                            fontSize="0.8em"
                                            borderRadius="md"
                                        >
                                            <Icon as={WarningIcon} mr={1} />
                                            Unreturned: {accLoan.unreturned}
                                        </Badge>
                                    </HStack>
                                </Flex>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            </Flex>
        </Box>
    );
};

export default ReserveEvent;
