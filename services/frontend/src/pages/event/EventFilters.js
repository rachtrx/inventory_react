import React from 'react';
import BookmarkFilter from '../forms/utils/BookmarkFilter';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';


const EventFilters = ({ filters }) => {

    return (
        <>
            <SelectFormControl
                name="deviceType"
                label="Device Type"
                placeholder="All"
                options={filters?.device_types?.map((device_type) => ({ label: device_type, value: device_type })) ?? []}
            />

            <InputFormControl
                name="modelName"
                label="Model Name"
                placeholder="All"
            />

            <SelectFormControl
                name="eventType"
                label="Event Type"
                placeholder="All"
                options={[
                    { label: "Registered", value: "registered" },
                    { label: "Loaned", value: "loaned" },
                    { label: "Returned", value: "returned" },
                    { label: "Condemned", value: "condemned" },
                    { label: "Created", value: "created" },
                    { label: "Removed", value: "removed" },
                ]}
            />

            <InputFormControl
                name="userName"
                label="Username"
                placeholder="All"
            />

            <InputFormControl
                name="serial-number"
                label="Serial Number"
                placeholder="All"
            />

            <InputFormControl
                name="asset-tag"
                label="Asset Tag"
                placeholder="All"
            />

            <BookmarkFilter/>

        </>
    )
};

export default EventFilters;