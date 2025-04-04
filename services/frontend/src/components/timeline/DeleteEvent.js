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
                    <ResponsiveText fontWeight="bold" size="lg" color="red.600">
                        Deleted
                    </ResponsiveText>
                    <DateText colorScheme="red" event={event}/>
                </HStack>
            </Flex>
        </VStack>
    );
};

export const DeleteEventBox = withEventBox(DeleteEvent)
