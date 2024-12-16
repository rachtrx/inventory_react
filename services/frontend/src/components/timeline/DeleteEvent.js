import { Flex, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import DateText from "./DateText";
import { ResponsiveText } from "../utils/ResponsiveText";

const DeleteEvent = ({ event }) => {
    return (
        <VStack
            align="stretch"
        >
            {/* Timeline Point */}
            <Flex align="center" position="relative">
                <HStack>
                    <DateText colorScheme="green" date={event.eventDate}/>
                    <ResponsiveText fontWeight="bold" size="lg" color="green.600">
                        Condemned
                    </ResponsiveText>
                </HStack>
            </Flex>
        </VStack>
    );
};

export default DeleteEvent;
