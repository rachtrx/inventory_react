import React, { useState } from "react";
import { AddEventBox } from "../AddEvent";
import { VStack } from "@chakra-ui/react";
import { AccLoanEventBox } from "./AccLoanEvent";
import { AccUpdateEventBox } from "./AccUpdateEvent";

const AccTimeline = ({ events }) => {
    console.log(events);
    return (
        <VStack spacing={2} align="stretch">
            {events.map((ev, id, arr) => {
                return (
                    ev.accTxn ? (
                        <AccUpdateEventBox event={ev} key={id} />
                    ) : ev.loan ? (
                        <AccLoanEventBox event={ev} key={id} />
                    ) : ev.reservation ? (
                        <AccLoanEventBox event={ev} key={id} /> // TODO change to reserve
                    ) : null
                );
            })}
        </VStack>
    );
};

export default AccTimeline;
