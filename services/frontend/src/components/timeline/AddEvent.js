import React from "react";
import {
    Box,
    Text,
    Flex,
    HStack,
    VStack,
    Badge,
    Divider,
    Icon,
    Heading,
} from "@chakra-ui/react";
import DateText from "./DateText";
import { ResponsiveText } from "../utils/ResponsiveText";

const AddEvent = ({ event }) => {
    return (
        <VStack
            align="stretch"
        >
            {/* Timeline Point */}
            <Flex align="center" position="relative">
                <HStack>
                    <ResponsiveText fontWeight="bold" size="lg" color="green.600">
                        Added
                    </ResponsiveText>
                    <DateText colorScheme="green" date={event.eventDate}/>
                </HStack>
            </Flex>
        </VStack>
    );
};

export default AddEvent;
