import {
    Text,
    Flex,
    HStack,
    VStack,
} from "@chakra-ui/react";
import DateText from "./utils/DateText";
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
                    <Text fontWeight="bold" fontSize="lg" color="green.600">
                        Added
                    </Text>
                    <DateText colorScheme="green" event={event}/>
                </HStack>
            </Flex>
        </VStack>
    );
};

export const AddEventBox = withEventBox(AddEvent)
