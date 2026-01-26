import React, { useState } from "react";
import { VStack } from "@chakra-ui/react";
import { AddEventBox } from "../AddEvent";
import { DeleteEventBox } from "../DeleteEvent";
import { AssetLoanEventBox } from "./AssetLoanEvent";
import { AssetReserveEventBox } from "./AssetReserveEvent";

const AssetTimeline = ({ events }) => {
    return (
        <VStack spacing={2} align="stretch">
            {events.map((ev, id, arr) => {
                return (
                    ev.loan ? (
                        <AssetLoanEventBox event={ev} key={id} />
                    ) : ev.reservation ? (
                        <AssetReserveEventBox event={ev} key={id} />
                    ) : null
                );
            })}
        </VStack>
    );
};

export default AssetTimeline;
