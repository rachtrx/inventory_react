import React, { useState } from "react";
import AddEvent from "./AddEvent";
import DeleteEvent from "./DeleteEvent";
import Timeline from "./Timeline";
import AssetLoanEvent from "./AssetLoanEvent";
import AssetReserveEvent from "./AssetReserveEvent";
import { VStack } from "@chakra-ui/react";
import { AddEventBox, AssetLoanEventBox, AssetReserveEventBox, DeleteEventBox } from "./utils/EventBox";
import { TimelineProvider } from "../../context/TImelineProvider";

const AssetTimeline = ({ events, assetId }) => {
    return (
        <TimelineProvider assetId={assetId}>
            <VStack spacing={2} align="stretch">
                {events.map((ev, id, arr) => {
                    return (
                        id === arr.length - 1 ? (
                            <AddEventBox event={ev} key={id} />
                        ) : id === 0 && !ev.loan && !ev.reservation ? (
                            <DeleteEventBox event={ev} key={id} />
                        ) : ev.loan ? (
                            <AssetLoanEventBox event={ev} key={id} />
                        ) : null
                    );
                })}
            </VStack>
        </TimelineProvider>
    );
};

export default AssetTimeline;
