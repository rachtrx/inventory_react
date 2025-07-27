import { Flex, HStack, Stat, StatNumber, Text, VStack } from "@chakra-ui/react";
import { withEventBox } from "../utils/withEventBox";
import DateText from "../utils/DateText";

export const AccUpdateEvent = ({ event }) => {

    const { accTxn } = event;
    const isAdd = accTxn.count > 0;

    return (
        <VStack
            align="stretch"
        >
            {/* Timeline Point */}
            <Flex align="center" position="relative">
                <HStack>
                    <Text fontWeight="bold" fontSize="lg" color="green.600">
                        Updated
                    </Text>
                    
                    <DateText colorScheme={isAdd ? "green" : "red"} event={event}/>
                    <Stat>
                        <StatNumber>{isAdd ? `+${accTxn.count}` : accTxn.count}</StatNumber>
                    </Stat>
                </HStack>
            </Flex>
        </VStack>
    );
};

export const AccUpdateEventBox = withEventBox(AccUpdateEvent)