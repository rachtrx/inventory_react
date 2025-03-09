import React, { useState } from "react";
import { AddEventBox } from "../AddEvent";
import { DeleteEventBox } from "../DeleteEvent";
import Timeline from "../Timeline";
import AssetReserveEvent from "../assets/AssetReserveEvent";
import { TimelineProvider } from "../../../context/TimelineProvider";
import { VStack } from "@chakra-ui/react";
import { AccLoanEventBox } from "./AccLoanEvent";

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
