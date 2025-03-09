import { Flex, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import DateText from "./utils/DateText";
import { ResponsiveText } from "../utils/ResponsiveText";
import { withEventBox } from "./utils/withEventBox";

const DeleteEvent = ({ event }) => {
    return (
        <VStack
            align="stretch"
        >
            {/* Timeline Point */}
            <Flex align="center" position="relative">
                <HStack>
                    <DateText colorScheme="green" event={event}/>
                    <ResponsiveText fontWeight="bold" size="lg" color="green.600">
                        Condemned
                    </ResponsiveText>
                </HStack>
            </Flex>
        </VStack>
    );
};

export const DeleteEventBox = withEventBox(DeleteEvent)
