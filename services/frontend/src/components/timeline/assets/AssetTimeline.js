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
                    id === arr.length - 1 && !ev.loan && !ev.reservation ? (
                        <AddEventBox event={ev} key={id} />
                    ) : id === 0 && !ev.loan && !ev.reservation ? (
                        <DeleteEventBox event={ev} key={id} />
                    ) : ev.loan ? (
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
