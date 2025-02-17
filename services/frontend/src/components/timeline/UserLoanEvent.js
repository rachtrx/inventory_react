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
import { BadgeGroup } from "./BadgeGroup";
import { ResponsiveText } from "../utils/ResponsiveText";

import { AccTypeLink, AssetLink, UserLink } from "../buttons/ItemLink";
import { AccStatus, ReturnEventTable } from "./utils/AccStatus";

const UserLoanEvent = ({ event }) => {
    console.log(event);
    const [isOpen, setIsOpen] = useState(false); // State to control collapse

    const { astLoan, accLoans, user, returnEvents } = event.loan;



    return (
        <VStack align="stretch" spacing={6}>
            {/* Left Panel: Accessory Details */}
            <VStack spacing={4} align="stretch">
                <HStack>
                    <ResponsiveText fontWeight="bold" size="lg" color="blue.600">
                        Loaned
                    </ResponsiveText>
                    <DateText colorScheme="blue" event={event} />
                </HStack>

                {!isOpen && returnEvents && Object.keys(returnEvents)?.length > 0 && (
                    <HStack>
                        <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                            Returned
                        </ResponsiveText>
                        {Object.values(returnEvents).map((event) => (
                            <DateText 
                                colorScheme={event.asset ? "yellow" : "gray"}
                                date={event.eventDate}
                            />
                        ))}
                    </HStack>
                )}

                <Flex position="absolute"
                    top={0}
                    right={0}
                    alignItems="flex-end" // Align content to the right
                    overflow="hidden"
                >   

                    {astLoan && <AssetLink asset={astLoan.asset}/>}
                    {accLoans && accLoans.length > 0 && (
                            accLoans.map(accLoan => (<AccTypeLink accType={accLoan.accType}/>))
                    )}
                </Flex>

                {!isOpen && accLoans && accLoans.length > 0 && (
                    <HStack>
                        {
                            accLoans.map(accLoan => (
                                <AccStatus key={accLoan.accessoryLoanId} accLoan={accLoan}></AccStatus>
                            ))
                        }
                    </HStack>
                )}
            </VStack>

            {isOpen && returnEvents && Object.keys(returnEvents).length > 0 && (
                <Box>
                    <VStack spacing={4} align="stretch">
                        <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                            Returned
                        </ResponsiveText>
                        {accLoans && accLoans.length > 0 && (
                            <HStack>
                                {
                                    accLoans.map(accLoan => (
                                        <AccStatus key={accLoan.accessoryLoanId} accLoan={accLoan}></AccStatus>
                                    ))
                                }
                            </HStack>
                        )}
                        <ReturnEventTable returnEvents={returnEvents}/>
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
