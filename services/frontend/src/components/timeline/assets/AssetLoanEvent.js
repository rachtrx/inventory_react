import { useState } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Button, Table, Thead, Tbody, Tr, Th, Td
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import DateText from "../utils/DateText";
import { UserLink } from "../../buttons/ItemLink";
import CheckBadge from "../../badges/CheckBadge";
import WarningBadge from "../../badges/WarningBadge";
import { AccStatus, AssetStatus } from "../utils/AccStatus";
import { withEventBox } from "../utils/withEventBox";
import ReturnEventTable from "../utils/ReturnEvents";
import SignatureViewer from "../utils/SignatureViewer";

const AssetLoanEvent = ({ event }) => {
    // console.log(event);
    const [isOpen, setIsOpen] = useState(false); // State to control collapse

    const { accLoans, user, returnEvents, filepath } = event.loan;

    const assetReturnEvent = returnEvents && returnEvents.find(ev => ev.asset);
    // console.log(assetReturnEvent);

    return (
        <VStack align="stretch" spacing={6}>
            {/* Left Panel: Accessory Details */}
            <VStack spacing={4} align="stretch">
                <HStack>
                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        Loaned
                    </Text>
                    <DateText colorScheme="blue" event={event}/>
                </HStack>

                {!isOpen && assetReturnEvent && (
                    <HStack>
                        <Text fontWeight="bold" fontSize="lg" color="yellow.600">
                            Returned
                        </Text>
                        <DateText 
                            colorScheme={"yellow"}
                            event={assetReturnEvent}
                        />
                    </HStack>
                )}
                {!isOpen && accLoans && accLoans.length > 0 && (
                    <HStack>
                        {
                            accLoans.map(accLoan => (
                                <AccStatus key={accLoan.accessoryLoanId} accLoan={accLoan}></AccStatus>
                            ))
                        }
                    </HStack>
                )}
                
                <UserLink position="absolute"
                    top={0}
                    right={0}
                    alignItems="flex-end" // Align content to the right
                    key={user.userId} 
                    user={user}
                    overflow="hidden"
                />
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
                                        <AccStatus key={accLoan.accessoryLoanId} accLoan={accLoan}/>
                                    ))
                                }
                            </HStack>
                        )}
                        <ReturnEventTable returnEvents={returnEvents}/>
                    </VStack>
                </Box>
            )}

            {returnEvents?.length && (<Button
                size="sm"
                variant="link"
                onClick={() => setIsOpen(!isOpen)} // Toggle collapse
            >
                {isOpen ? "Hide Details" : "Show Details"}
            </Button>)}
        </VStack>
    );
};

export const AssetLoanEventBox = withEventBox(AssetLoanEvent)
