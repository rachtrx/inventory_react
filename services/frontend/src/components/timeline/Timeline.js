import React, { useState } from "react";
import {
    Box,
    VStack,
} from "@chakra-ui/react";

const Timeline = ({ 
    events,
    AddEventComponent, 
    DelEventComponent, 
    LoanEventComponent, 
    ReserveEventComponent, 
}) => {

    // const getEventComponent = (_event) => {
    //     switch(_event) {
    //         case "loan":
    //             return <LoanEventComponent event={events} />;
    //         case "reserve":
    //             return <ReserveEventComponent event={events} />;
    //         default:
    //             return null;
    //     }
    // }

    return (
        <VStack spacing={2} align="stretch">
        {events.map((ev, id, arr) => (
            <Box
                key={id}
                position="relative"
            >

                {/* Event Content */}
                <Box
                    p={2}
                    bg="gray.50"
                    borderRadius="lg"
                    boxShadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                    w="100%"
                >
                    {/* <Text fontSize="sm" color="gray.700" mb={2}>
                        <strong>Event Type:</strong> {ev.eventType || "N/A"}
                    </Text> */}
                    {id === arr.length - 1 && !ev.loan && !ev.reservation ? (
                        /* Render AddEvent Component */
                        <AddEventComponent event={ev} />
                    ) : id === 0 && !ev.loan && !ev.reservation ? (
                        <DelEventComponent event={ev} />
                    ) : ev.loan ? (
                        <LoanEventComponent event={ev} />
                    ) : ev.reservation ? (
                        <ReserveEventComponent event={ev}/>
                    ) : null}
                </Box>
            </Box>
        ))}
    </VStack>
    );
};

export default Timeline;
