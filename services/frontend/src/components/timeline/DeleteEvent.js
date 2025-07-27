import { Flex, HStack, Text, VStack } from "@chakra-ui/react";
import DateText from "./utils/DateText";
import { withEventBox } from "./utils/withEventBox";

const DeleteEvent = ({ event }) => {
    return (
        <VStack
            align="stretch"
        >
            {/* Timeline Point */}
            <Flex align="center" position="relative">
                <HStack>
                    <Text fontWeight="bold" fontSize="lg" color="red.600">
                        Deleted
                    </Text>
                    <DateText colorScheme="red" event={event}/>
                </HStack>
            </Flex>
        </VStack>
    );
};

export const DeleteEventBox = withEventBox(DeleteEvent)
