import React, { useState } from "react";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Badge,
    Separator,
    Icon,
    Collapsible,
    Button,
} from "@chakra-ui/react";
import { FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import DateText from "./DateText";
import AccessoryBadge from "./AccessoryBadge";
import { ResponsiveText } from "../utils/ResponsiveText";

const LoanEvent = ({ event }) => {
    console.log(event);
    const { accLoans, returnEvents } = event.loan;

    const [open, setIsOpen] = useState(false); // State to control collapse

    return (
        <VStack align="stretch" gap={6}>
            {/* Left Panel: Accessory Details */}
            <VStack gap={4} align="stretch">
                <HStack>
                    <ResponsiveText fontWeight="bold" size="lg" color="blue.600">
                        Loan
                    </ResponsiveText>
                    <DateText colorPalette="blue" date={event.eventDate} />
                    <Button
                        size="sm"
                        variant="link"
                        onClick={() => setIsOpen(!open)} // Toggle collapse
                    >
                        {open ? "Hide Details" : "Show Details"}
                    </Button>
                </HStack>

                <Collapsible open={open} animateOpacity>
                    {accLoans &&
                        accLoans.length > 0 &&
                        accLoans.map((accLoan, index) => (
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
                                            colorPalette="green"
                                            fontSize="0.8em"
                                            borderRadius="md"
                                        >
                                            <Icon as={FiCheckCircle} mr={1} />
                                            Returned: {accLoan.returned}
                                        </Badge>
                                        {/* Unreturned Count */}
                                        {accLoan.unreturned &&
                                            accLoan.unreturned > 0 && (
                                                <Badge
                                                    colorPalette="red"
                                                    fontSize="0.8em"
                                                    borderRadius="md"
                                                >
                                                    <Icon as={FiAlertTriangle} mr={1} />
                                                    Unreturned: {accLoan.unreturned}
                                                </Badge>
                                            )}
                                    </HStack>
                                </Flex>
                            </Box>
                        ))}
                </Collapsible>
            </VStack>

            {returnEvents && Object.keys(returnEvents).length > 0 && (
                <Box>
                    <VStack gap={4} align="stretch">
                        <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                            Returns
                        </ResponsiveText>
                        {Object.entries(returnEvents).map(([eventId, event], index) => (
                            <Box
                                key={index}
                                p={4}
                                bg="white"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.300"
                                boxShadow="sm"
                            >
                                <DateText 
                                    colorPalette={event.isAsset ? "yellow" : "gray"} 
                                    date={event.eventDate} />
                                <Collapsible in={open} animateOpacity>
                                    {event.remarks && (
                                        <Text fontSize="sm" mt={1} color="gray.600">
                                            Remark: {event.remarks}
                                        </Text>
                                    )}
                                    <Separator my={2} />
                                    <Text
                                        fontSize="xs"
                                        fontWeight="medium"
                                        color="gray.500"
                                        mb={2}
                                    >
                                        Returned Accessories:
                                    </Text>
                                    <AccessoryBadge accessories={event.accessories} />
                                </Collapsible>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            )}
        </VStack>
    );
};

export default LoanEvent;
