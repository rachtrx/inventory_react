import { Badge, Text, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../utils/ResponsiveText"
import RemarksPopover from "./RemarksPopover";
import AddRemark from "../AddRemark";

const DateText = ({ colorScheme, event }) => {

    // console.log(event);

    const { eventDate, remarks, eventId } = event;
    return (
        <Badge 
            colorScheme={colorScheme} 
            display="inline-flex"
            alignItems="center"
            gap={0.5}
            borderRadius="md"
        >
            <Text as="span" fontSize="sm" fontWeight="bold">{eventDate}</Text>
            <RemarksPopover>
                {/* Existing Remarks */}
                <VStack align="stretch" spacing={3} mb={4}>
                    {remarks.length > 0 ? (
                        remarks.map((remark, idx) => (
                            <ResponsiveText
                                key={idx}
                                fontSize="sm"
                                color="gray.700"
                                borderLeft="2px solid"
                                borderColor="blue.400"
                                pl={2}
                            >
                                {remark.text || "No remark"}
                            </ResponsiveText>
                        ))
                    ) : (
                        <ResponsiveText fontSize="sm" color="gray.500">
                            No remarks yet.
                        </ResponsiveText>
                    )}
                </VStack>
                <AddRemark eventId={eventId}/>
            </RemarksPopover>
        </Badge>
    );
};


export default DateText;