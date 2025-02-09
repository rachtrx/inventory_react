import React, { useEffect, useState } from "react";
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
import LoanEvent from "./AssetLoanEvent";
import DeleteEvent from "./DeleteEvent";
import ReserveEvent from "./AssetReserveEvent";
import historyService from "../../services/HistoryService";
import { useUI } from "../../context/UIProvider";

const History = () => {

    // { 
    //     events,
    //     AddEventComponent, 
    //     DelEventComponent, 
    //     LoanEventComponent, 
    //     ReserveEventComponent, 
    // }

    const [events, setEvents] = useState([])
    const { handleError } = useUI();
    
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = historyService.loadAllEvents([]);
                setEvents(response.data);
            } catch (e) {
                handleError(e);
            }
        }
        
        fetchHistory();
    })

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
                </Box>
            </Box>
        ))}
    </VStack>
    );
};

export default History;
