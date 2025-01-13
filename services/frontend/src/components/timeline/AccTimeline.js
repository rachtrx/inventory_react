import React, { useState } from "react";
import AddEvent from "./AddEvent";
import DeleteEvent from "./DeleteEvent";
import Timeline from "./Timeline";
import AccLoanEvent from "./AccLoanEvent";
import AssetReserveEvent from "./AssetReserveEvent";

const AccTimeline = (props) => {
    return (
        <Timeline
            AddEventComponent={AddEvent}
            DelEventComponent={DeleteEvent}
            LoanEventComponent={AccLoanEvent}
            ReserveEventComponent={AssetReserveEvent}
            {...props}
        />
    );
};

export default AccTimeline;
