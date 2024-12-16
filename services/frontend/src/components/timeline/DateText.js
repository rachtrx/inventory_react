import { Badge, Text } from "@chakra-ui/react";
import { ResponsiveText } from "../utils/ResponsiveText"
import RemarksPopover from "./RemarksPopover";

const DateText = ({ colorScheme, date, remarks }) => {
    return (
        <Badge 
            colorScheme={colorScheme} 
            display="inline-flex"
            alignItems="center" 
            px={3} // Padding for better appearance
            py={1} // Padding for better appearance
            gap={2}
            borderRadius="md"
        >
            <Text as="span" fontSize="sm" fontWeight="bold">
                {new Date(date).toLocaleDateString("en-SG", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </Text>
            <RemarksPopover remarks={remarks} />
        </Badge>
    );
};


export default DateText;