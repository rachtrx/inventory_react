import React, { useState } from "react";
import AddEvent from "./AddEvent";
import DeleteEvent from "./DeleteEvent";
import UserLoanEvent from "./UserLoanEvent";
import AssetReserveEvent from "./AssetReserveEvent";
import Timeline from "./Timeline";

const UserTimeline = (props) => {
    return (
        <Timeline
            AddEventComponent={AddEvent}
            DelEventComponent={DeleteEvent}
            LoanEventComponent={UserLoanEvent}
            ReserveEventComponent={AssetReserveEvent} // TODO
            {...props}
        />
    );
};

export default UserTimeline;
