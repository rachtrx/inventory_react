import { HStack } from "@chakra-ui/react"
import CheckBadge from "../../badges/CheckBadge"
import WarningBadge from "../../badges/WarningBadge"

import {Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { BadgeGroup } from "../BadgeGroup";
import DateText from "../DateText";
import { useTimeline } from "../../../context/TImelineProvider";

const AccStatus = ({accLoan}) => {

    const allReturned = accLoan.unreturned === 0

    const accName = accLoan.accType.accessoryName;

    return (
        <>
            {allReturned ? (
                <CheckBadge text={`${accName}: ${accLoan.returned}/${accLoan.count}`} />
            ) : (
                <WarningBadge text={`${accName}: ${accLoan.unreturned}/${accLoan.count}`} />
            )}
        </>
    );
}

const AstStatus = ({astLoan}) => {

    const returned = astLoan.returnEvent ? 1 : 0
    const serialNumber = astLoan.asset.serialNumber

    return (
        <>
            {returned ? (
                <CheckBadge text={`${serialNumber}: ${returned}/1`} />
            ) : (
                <WarningBadge text={`${serialNumber}: ${returned}/1`} />
            )}
        </>
    );
}

const ReturnEventTable = ({returnEvents}) => {

    return (
        <Table variant="simple" size="sm" width="100%">
            {/* Table Headers */}
            <Thead>
                <Tr>
                    <Th fontSize="xs" color="gray.600">Date</Th>
                    <Th fontSize="xs" color="gray.600">Returned Items</Th>
                </Tr>
            </Thead>
            <Tbody>
                {Object.entries(returnEvents).map(([eventId, event]) => <EventTableRow key={eventId} event={event}/>)}
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

export { AstStatus, AccStatus, ReturnEventTable };