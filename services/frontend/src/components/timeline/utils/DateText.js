import { Badge, Box, Divider, Flex, Text, VStack } from "@chakra-ui/react";
import RemarksPopover from "./RemarksPopover";
import { RemarkInput } from "../RemarkInput";

const DateText = ({ colorScheme, event, ...props }) => {

    // console.log(event);

    const { eventDate, remarks, eventId } = event;
    return (
        <Badge 
            colorScheme={colorScheme} 
            display="inline-flex"
            alignItems="center"
            gap={0.5}
            borderRadius="md"
            alignSelf="start"
            justifySelf="start"
            w="fit-content"
            {...props}
        >
            <Text as="span" fontSize="sm" fontWeight="bold">{eventDate}</Text>
            <RemarksPopover>
                {/* Existing Remarks */}
                <VStack align="stretch" spacing={3} mb={4} overflowY="auto">
                    {remarks.length > 0 ? (
                        remarks.map((remark, idx) => (
                            <Flex key={idx} alignItems="stretch">
                                <Text fontSize="sm" whiteSpace="nowrap">
                                    {remark.remarkDate}
                                </Text>

                                <Box
                                    width="1px"
                                    bg="blue.400"
                                    mx={1}
                                    alignSelf="stretch"
                                />

                                <Text
                                    fontSize="sm"
                                    color="gray.700"
                                    whiteSpace="normal"
                                >
                                    {remark.text || "No remark"}
                                </Text>
                            </Flex>
                        ))
                    ) : (
                        <Text fontSize="sm" color="gray.500">
                            No remarks yet.
                        </Text>
                    )}
                </VStack>
                <RemarkInput eventId={eventId}/>
            </RemarksPopover>
        </Badge>
    );
};


export default DateText;