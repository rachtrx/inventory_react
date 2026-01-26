import { Badge, Text } from "@chakra-ui/react";
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
            <RemarksPopover remarks={remarks} eventId={eventId}/>
        </Badge>
    );
};


export default DateText;