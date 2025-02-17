import React, { useState } from "react";
import AddEvent from "./AddEvent";
import DeleteEvent from "./DeleteEvent";
import Timeline from "./Timeline";
import AccLoanEvent from "./AccLoanEvent";
import AssetReserveEvent from "./AssetReserveEvent";
import { TimelineProvider } from "../../context/TImelineProvider";
import { VStack } from "@chakra-ui/react";
import { AccLoanEventBox, AddEventBox, DeleteEventBox } from "./utils/EventBox";

const AccTimeline = ({ events, accessoryTypeId }) => {
    return (
        <TimelineProvider accessoryTypeId={accessoryTypeId}>
            <VStack spacing={2} align="stretch">
                {events.map((ev, id, arr) => {
                    return (
                        id === arr.length - 1 && !ev.loan && !ev.reservation ? (
                            <AddEventBox event={ev} key={id} />
                        ) : id === 0 && !ev.loan && !ev.reservation ? (
                            <DeleteEventBox event={ev} key={id} />
                        ) : ev.loan ? (
                            <AccLoanEventBox event={ev} key={id} />
                        ) : ev.reservation ? (
                            <AccLoanEventBox event={ev} key={id} /> // TODO change to reserve
                        ) : null
                    );
                })}
            </VStack>
        </TimelineProvider>
    );
};

export default AccTimeline;
