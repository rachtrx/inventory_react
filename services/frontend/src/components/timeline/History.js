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
import { ResponsiveText } from "../utils/ResponsiveText";

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
                const response = await historyService.loadAllEvents();
                console.log(response.data);
                setEvents(response.data);
            } catch (e) {
                handleError(e);
            }
        }
        
        fetchHistory();
    })

    return (
        <VStack spacing={2} align="stretch">
        {events?.length > 0 && (
            <Flex direction="column">
                {events.map((ev, id, arr) => (
                    <ResponsiveText>{ev.description}</ResponsiveText>
                ))}
            </Flex>
        )}
    </VStack>
    );
};

export default History;
