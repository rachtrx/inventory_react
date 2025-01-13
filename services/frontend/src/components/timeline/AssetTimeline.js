import React, { useState } from "react";
import AddEvent from "./AddEvent";
import DeleteEvent from "./DeleteEvent";
import Timeline from "./Timeline";
import AssetLoanEvent from "./AssetLoanEvent";
import AssetReserveEvent from "./AssetReserveEvent";

const AssetTimeline = (props) => {
    return (
        <Timeline
            AddEventComponent={AddEvent}
            DelEventComponent={DeleteEvent}
            LoanEventComponent={AssetLoanEvent}
            ReserveEventComponent={AssetReserveEvent}
            {...props}
        />
    );
};

export default AssetTimeline;
