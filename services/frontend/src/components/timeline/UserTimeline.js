import React, { useState } from "react";
import AddEvent from "./AddEvent";
import DeleteEvent from "./DeleteEvent";
import UserLoanEvent from "./UserLoanEvent";
import AssetReserveEvent from "./AssetReserveEvent";
import Timeline from "./Timeline";
import { TimelineProvider } from "../../context/TImelineProvider";
import { VStack } from "@chakra-ui/react";
import { AddEventBox, DeleteEventBox, UserLoanEventBox } from "./utils/EventBox";

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
