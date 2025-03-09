import { Box, Collapse, Divider, Text } from "@chakra-ui/react";
import DateText from "./DateText";
import { BadgeGroup } from "./BadgeGroup";
import { useEffect, useState } from "react";
import { useDrawer } from "../../../context/DrawerProvider";
import accessoryService from "../../../services/AccessoryService";

const ReturnBadge = ({eventId, event}) => {

    const [isOpen, setIsOpen] = useState(false);

    const { currentItem } = useDrawer();
    const [isMain, setIsMain] = useState(false);

    useEffect(() => {
        if (currentItem?.service?.constructor.name === accessoryService.constructor.name) {
            const hasAccessory = event.accessories?.some(accessory => accessory.accessoryTypeId === currentItem.breadcrumbId);
            if (hasAccessory) {
                setIsMain(true);
            } else {
                setIsMain(event.asset ? true : false);
            }
        }
    }, [currentItem, event.accessories, event.asset])

    return(
        <Box
            key={eventId}
            p={4}
            bg="white"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.300"
            boxShadow="sm"
        >
            <DateText
                colorScheme={isMain ? "yellow" : "gray"}
                event={event}
            />
            <Collapse in={isOpen} animateOpacity>
                {event.remarks && (
                    <Text fontSize="sm" mt={1} color="gray.600">
                        Remark: {event.remarks}
                    </Text>
                )}
            </Collapse>
            <Divider my={2} />
                <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color="gray.500"
                    mb={2}
                >
                    Returned Accessories:
                </Text>
            <BadgeGroup accessories={event.accessories} />
        </Box>
    )
}

export default ReturnBadge;