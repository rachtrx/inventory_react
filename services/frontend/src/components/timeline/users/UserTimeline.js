import React, { useState } from "react";
import { AddEventBox } from "../AddEvent";
import { DeleteEventBox } from "../DeleteEvent";
import { UserLoanEventBox } from "./UserLoanEvent";
import AssetReserveEvent from "../assets/AssetReserveEvent";
import Timeline from "../Timeline";
import { VStack } from "@chakra-ui/react";

const UserTimeline = ({events}) => {
    return (
        <VStack spacing={2} align="stretch">
            {events.map((ev, id, arr) => {
                return (
                    ev.loan ? (
                        <UserLoanEventBox event={ev} key={id} />
                    ) : ev.reservation ? (
                        <UserLoanEventBox event={ev} key={id} />
                    ) : null
                );
            })}
        </VStack>
    );
};

export default UserTimeline;
