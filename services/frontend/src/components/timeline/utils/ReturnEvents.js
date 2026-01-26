import { HStack } from "@chakra-ui/react"
import CheckBadge from "../../badges/CheckBadge"
import WarningBadge from "../../badges/WarningBadge"

import {Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { BadgeGroup } from "./BadgeGroup";
import DateText from "./DateText";

const ReturnEventTable = ({returnEvents}) => {

    return (
        <Table variant="simple" size="sm" width="100%">
            {/* Table Headers */}
            <Thead>
                <Tr>
                    <Th fontSize="xs" color="gray">Date</Th>
                    <Th fontSize="xs" color="gray">Returned Items</Th>
                </Tr>
            </Thead>
            <Tbody>
                {returnEvents.map((event, idx) => <EventTableRow key={idx} event={event}/>)}
            </Tbody>
        </Table>

    )
}

const EventTableRow = ({event}) => {

    return (
        <Tr key={event.eventId}>
            {/* DateText (Keeping it as required) */}
            <Td fontSize="xs">
                <DateText
                    colorScheme={event.asset ? "yellow" : "gray"} 
                    event={event}
                />
            </Td>

            <Td fontSize="xs">
                <BadgeGroup 
                    asset={event.asset || undefined}
                    accessories={event.accessories}
                />
            </Td>
        </Tr>
    )
}

export default ReturnEventTable;