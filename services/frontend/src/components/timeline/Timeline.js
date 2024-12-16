import React, { useState } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Circle,
    Button,
    Flex
} from "@chakra-ui/react";
import { AddIcon, DownloadIcon } from "@chakra-ui/icons";
import { Formik, Form, Field } from "formik";
import AddRemark from "./AddRemark";
import AddEvent from "./AddEvent";
import LoanEvent from "./LoanEvent";
import DeleteEvent from "./DeleteEvent";
import ReserveEvent from "./ReserveEvent";

const Timeline = ({ events, handleAddRemark }) => {
    return (
        <VStack spacing={2} align="stretch">
        {events.map((ev, id, arr) => (
            <Box
                key={id}
                position="relative"
            >

                {/* Event Content */}
                <Box
                    p={6}
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
                    {id === 0 && !ev.loan && !ev.reservation ? (
                        /* Render AddEvent Component */
                        <AddEvent event={ev} />
                    ) : id === arr.length - 1 && !ev.loan && !ev.reservation ? (
                        <DeleteEvent event={ev} />
                    ) : ev.loan ? (
                        /* Render AddEvent Component */
                        <LoanEvent event={ev} />
                    ) : ev.reservation ? (
                        <ReserveEvent event={ev}/>
                    ) : null}
                </Box>
            </Box>
        ))}
    </VStack>
    );
};

export default Timeline;
