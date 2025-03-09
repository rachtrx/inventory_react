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
import DateText from "./utils/DateText";
import { ResponsiveText } from "../utils/ResponsiveText";
import { withEventBox } from "./utils/withEventBox";

const AddEvent = ({ event }) => {

    console.log(event);

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
                    <DateText colorScheme="green" event={event}/>
                </HStack>
            </Flex>
        </VStack>
    );
};

export const AddEventBox = withEventBox(AddEvent)
