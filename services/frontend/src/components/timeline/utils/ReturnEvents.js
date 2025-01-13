import { Box, Collapse, Divider, Text, VStack } from "@chakra-ui/react"
import AccessoryBadge from "../AccessoryBadge"
import { useDrawer } from "../../../context/DrawerProvider"
import { useEffect, useState } from "react";
import { ResponsiveText } from "../../utils/ResponsiveText";
import DateText from "../DateText";
import accessoryService from "../../../services/AccessoryService";
import ReturnBadge from "./ReturnBadge";

const ReturnEvents = ({
    display, 
    returnEvents
}) => {

    return (
        <Box>
            <VStack spacing={4} align="stretch">
                <ResponsiveText fontWeight="bold" size="lg" color="yellow.600">
                    Returned
                </ResponsiveText>
                {Object.entries(returnEvents).map(([eventId, event]) => (
                    <ReturnBadge eventId={eventId} event={event}/>
                ))}
            </VStack>
        </Box>
    )
}

export default ReturnEvents;