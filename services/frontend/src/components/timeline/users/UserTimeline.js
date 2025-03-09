import React, { useState } from "react";
import { AddEventBox } from "../AddEvent";
import { DeleteEventBox } from "../DeleteEvent";
import { UserLoanEventBox } from "./UserLoanEvent";
import AssetReserveEvent from "../assets/AssetReserveEvent";
import Timeline from "../Timeline";
import { TimelineProvider } from "../../../context/TimelineProvider";
import { VStack } from "@chakra-ui/react";

const UserTimeline = ({events}) => {
    return (
        <TimelineProvider>
            <VStack spacing={2} align="stretch">
                {events.map((ev, id, arr) => {
                    return (
                        id === arr.length - 1 && !ev.loan && !ev.reservation ? (
                            <AddEventBox event={ev} key={id} />
                        ) : id === 0 && !ev.loan && !ev.reservation ? (
                            <DeleteEventBox event={ev} key={id} />
                        ) : ev.loan ? (
                            <UserLoanEventBox event={ev} key={id} />
                        ) : ev.reservation ? (
                            <UserLoanEventBox event={ev} key={id} />
                        ) : null
                    );
                })}
            </VStack>
        </TimelineProvider>
    );
};

export default UserTimeline;
