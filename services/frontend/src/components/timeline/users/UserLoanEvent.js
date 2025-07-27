import React, { useState } from "react";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Button,
} from "@chakra-ui/react";
import DateText from "../utils/DateText";

import { AccTypeLink, AssetLink, UserLink } from "../../buttons/ItemLink";
import { AccStatus } from "../utils/AccStatus";
import { withEventBox } from "../utils/withEventBox";
import ReturnEventTable from "../utils/ReturnEvents";
import SignatureViewer from "../utils/SignatureViewer";

const UserLoanEvent = ({ event }) => {
    console.log(event);
    const [isOpen, setIsOpen] = useState(false); // State to control collapse

    const { astLoan, accLoans, returnEvents, filepath } = event.loan;

    console.log(returnEvents);

    return (
        <VStack align="stretch" spacing={6}>
            {/* Left Panel: Accessory Details */}
            <VStack spacing={4} align="stretch">
                <HStack>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        Loaned
                    </Text>
                    <DateText colorScheme="blue" event={event} />
                </HStack>

                {!isOpen && returnEvents?.length && (
                    <HStack>
                        <Text fontWeight="bold" fontSize="lg" color="yellow.600">
                            Returned
                        </Text>
                        {returnEvents.map((event) => (
                            <DateText 
                                colorScheme={event.asset ? "yellow" : "gray"}
                                event={event}
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
                {filepath && <SignatureViewer filepath={filepath}/>}
            </VStack>

            {isOpen && returnEvents?.length && (
                <Box>
                    <VStack spacing={4} align="stretch">
                        <Text fontWeight="bold" fontSize="lg" color="yellow.600">
                            Returned
                        </Text>
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

            {returnEvents?.length && <Button
                size="sm"
                variant="link"
                onClick={() => setIsOpen(!isOpen)} // Toggle collapse
            >
                {isOpen ? "Hide Details" : "Show Details"}
            </Button>}
        </VStack>
    );
};

export const UserLoanEventBox = withEventBox(UserLoanEvent)
