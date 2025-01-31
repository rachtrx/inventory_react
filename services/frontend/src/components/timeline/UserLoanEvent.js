import React, { useState } from "react";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Badge,
    Divider,
    Icon,
    Collapse,
    Button,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import DateText from "./DateText";
import AccessoryBadge from "./AccessoryBadge";
import { ResponsiveText } from "../utils/ResponsiveText";

import { AccTypeLink, AssetLink, UserLink } from "../buttons/ItemLink";

const UserLoanEvent = ({ event }) => {
    console.log(event);
    const [isOpen, setIsOpen] = useState(false); // State to control collapse

    const { astLoan, accLoans, userLoans, returnEvents } = event.loan;

    return (
        <VStack align="stretch" spacing={6}>
            {/* Left Panel: Accessory Details */}
            <VStack spacing={4} align="stretch">
                <HStack>
                    <ResponsiveText fontWeight="bold" size="lg" color="blue.600">
                        Loaned
                    </ResponsiveText>
                    <DateText colorScheme="blue" date={event.eventDate} />
                </HStack>

                {!isOpen && returnEvents && (
                    <HStack>
                        <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                            Returned
                        </ResponsiveText>
                        {Object.values(returnEvents).map((event) => (
                            <DateText 
                                colorScheme={event.isAsset ? "yellow" : "gray"}
                                date={event.eventDate}
                            />
                        ))}
                    </HStack>
                )}

                {astLoan && (
                    <HStack>
                        <ResponsiveText fontWeight="bold" size="lg" color="black">
                            Asset
                        </ResponsiveText>
                        <AssetLink asset={astLoan.asset}/>
                    </HStack>
                )}

                {accLoans && accLoans.length > 0 && (
                    <HStack>
                        <ResponsiveText fontWeight="bold" size="lg" color="black">
                            Accessories
                        </ResponsiveText>
                        {accLoans.map(accLoan => (<AccTypeLink accType={accLoan.accType}/>))}
                    </HStack>
                )}

                {userLoans?.loan?.userLoans && userLoans.loan.userLoans.length > 0 && (
                    <HStack>
                        <ResponsiveText fontWeight="bold" size="lg" color="black">
                            Other User
                        </ResponsiveText>
                        {userLoans.map(userLoan => (<UserLink key={userLoan.user.userId} accType={userLoan.user}/>))}
                    </HStack>
                )}

                <Collapse in={isOpen} animateOpacity>
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
                                        {accLoan.accType.accessoryName.toUpperCase()}
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
                                        {accLoan.unreturned &&
                                            accLoan.unreturned > 0 && (
                                                <Badge
                                                    colorScheme="red"
                                                    fontSize="0.8em"
                                                    borderRadius="md"
                                                >
                                                    <Icon as={WarningIcon} mr={1} />
                                                    Unreturned: {accLoan.unreturned}
                                                </Badge>
                                            )}
                                    </HStack>
                                </Flex>
                            </Box>
                        ))}
                </Collapse>
            </VStack>

            {isOpen && returnEvents && Object.keys(returnEvents).length > 0 && (
                <Box>
                    <VStack spacing={4} align="stretch">
                        <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                            Returned
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
                                    colorScheme={event.isAsset ? "yellow" : "gray"} 
                                    date={event.eventDate} />
                                <Collapse in={isOpen} animateOpacity>
                                    {event.remarks && (
                                        <Text fontSize="sm" mt={1} color="gray.600">
                                            Remark: {event.remarks}
                                        </Text>
                                    )}
                                    <Divider my={2} />
                                    <Text
                                        fontSize="xs"
                                        fontWeight="medium"
                                        color="gray.500"
                                        mb={2}
                                    >
                                        Returned Accessories:
                                    </Text>
                                    <AccessoryBadge accessories={event.accessories} />
                                </Collapse>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            )}

            <Button
                size="sm"
                variant="link"
                onClick={() => setIsOpen(!isOpen)} // Toggle collapse
            >
                {isOpen ? "Hide Details" : "Show Details"}
            </Button>
        </VStack>
    );
};

export default UserLoanEvent;
