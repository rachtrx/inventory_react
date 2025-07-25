import React, { useState } from "react";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Collapse,
    Button,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import DateText from "../utils/DateText";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { AssetLink, UserLink } from "../../buttons/ItemLink";
import { useDrawer } from "../../../context/DrawerProvider";
import { AccStatus, AstStatus } from "../utils/AccStatus";
import { withEventBox } from "../utils/withEventBox";
import ReturnEventTable from "../utils/ReturnEvents";
import SignatureViewer from "../utils/SignatureViewer";

const AccLoanEvent = ({ event }) => {
    console.log(event);
    const [isOpen, setIsOpen] = useState(false); // State to control collapse
    const { accLoans, user, returnEvents, astLoan, filepath } = event.loan;

    console.log(accLoans);

    const accReturnEvents = returnEvents.filter(event => event.accessories.find(accessory => accessory.isMatching))

    console.log(accReturnEvents);

    return (
        <VStack align="stretch" spacing={6}>
            {/* Left Panel: Accessory Details */}
            <VStack spacing={4} align="stretch">
                <HStack>
                    <ResponsiveText fontWeight="bold" size="lg" color="blue.600">
                        Loaned
                    </ResponsiveText>
                    <DateText colorScheme="blue" event={event}/>
                </HStack>

                {!isOpen && accReturnEvents?.length && (
                    <HStack>
                        <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                            Returned
                        </ResponsiveText>
                        {
                            
                            accReturnEvents.map(event => (
                                <DateText 
                                    key={event.eventId}
                                    colorScheme={"yellow"}
                                    event={event}
                                /> 
                            ))
                        }
                    </HStack>
                )}

                {accLoans?.length && (
                    <HStack>
                        {astLoan && <AstStatus astLoan={astLoan}/>}
                        {
                            accLoans.map(accLoan => (
                                <AccStatus key={accLoan.accessoryLoanId} accLoan={accLoan}></AccStatus>
                            ))
                        }
                    </HStack>
                )}
                <Flex
                    position="absolute"
                    top={0}
                    right={0}
                    alignItems="flex-end" // Align content to the right
                    overflow="hidden"
                >
                    <UserLink user={user}/>
                    {astLoan && <AssetLink asset={astLoan.asset}/>}
                </Flex>

                {filepath && <SignatureViewer filepath={filepath}/>}
            </VStack>

            {isOpen && returnEvents?.length && (
                <Box>
                <VStack spacing={4} align="stretch">
                    <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                        Returned
                    </ResponsiveText>
                    {accLoans && accLoans.length > 0 && (
                        <HStack>
                            {astLoan && <AstStatus astLoan={astLoan}/>}
                            {
                                accLoans.map(accLoan => (
                                    <AccStatus key={accLoan.accessoryLoanId} accLoan={accLoan}/>
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

export const AccLoanEventBox = withEventBox(AccLoanEvent)