import { Flex, HStack, Stat, StatLabel, StatNumber, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../utils/ResponsiveText";
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
                    <ResponsiveText fontWeight="bold" size="lg" color="green.600">
                        Updated
                    </ResponsiveText>
                    
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