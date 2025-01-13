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
import DateText from "./DateText";
import { ResponsiveText } from "../utils/ResponsiveText";
import { AssetLink, UserLink } from "../buttons/ItemLink";
import { useDrawer } from "../../context/DrawerProvider";
import AccStatus from "./utils/AccStatus";
import ReturnEvents from "./utils/ReturnEvents";

const AccLoanEvent = ({ event }) => {
    console.log(event);
    const [isOpen, setIsOpen] = useState(false); // State to control collapse

    const { currentItem } = useDrawer();

    const { accLoans, userLoans, returnEvents, astLoan } = event.loan;

    return (
        <VStack align="stretch" spacing={6}>
            {/* Left Panel: Accessory Details */}
            <VStack spacing={4} align="stretch">
                <HStack>
                    <ResponsiveText fontWeight="bold" size="lg" color="blue.600">
                        Loaned
                    </ResponsiveText>
                    <DateText colorScheme="blue" date={event.eventDate} remarks={event.remarks}/>
                    {!isOpen && <AccStatus accLoan={accLoans.find(accLoan => accLoan.accessoryTypeId === currentItem.breadcrumbId)}/>}
                </HStack>
                {!isOpen && returnEvents && Object.keys(returnEvents).length > 0 && (
                    <HStack>
                        <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                            Returned
                        </ResponsiveText>
                        {Object.entries(returnEvents)
                            .filter(([eventId, event]) => event.accessories.find(accessory => accessory.accessoryTypeId === currentItem.breadcrumbId))
                            .map(([eventId, event]) => (<DateText 
                                key={event.eventId}
                                colorScheme={"yellow"}
                                date={event.eventDate}
                                remarks={event.remarks}
                            />))
                        }
                    </HStack>
                )}
                <HStack>
                    <ResponsiveText fontWeight="bold" size="lg" color="black">
                        User
                    </ResponsiveText>
                    {userLoans.map(userLoan => (<UserLink key={userLoan.user.userId} user={userLoan.user}/>))}
                </HStack>
                
                {astLoan && (
                    <HStack>
                        <ResponsiveText fontWeight="bold" size="lg" color="black">
                            Asset
                        </ResponsiveText>
                        <AssetLink asset={astLoan.asset}/>
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
                                        {accLoan.accessoryName.toUpperCase()}
                                    </Text>
                                    <AccStatus accLoan={accLoan}/>
                                </Flex>
                            </Box>
                        ))}
                </Collapse>
            </VStack>

            {isOpen && returnEvents && Object.keys(returnEvents).length > 0 && (
                <ReturnEvents display={isOpen} returnEvents={returnEvents}/>
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

export default AccLoanEvent;
