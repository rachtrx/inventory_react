import React, { useEffect } from 'react';
import InputFormControl from '../forms/utils/InputFormControl';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import { Form, Formik } from 'formik';
import { useItems } from '../../context/ItemsProvider';
import eventService from '../../services/EventService';
import DateInputControl from '../forms/utils/DateInputControl';
import { CheckboxGroupField } from '../forms/utils/CheckboxGroupField';
import CheckboxField from '../forms/utils/CheckboxField';


const ReminderFilters = () => {

    const { filters } = useItems();

    return (
        <>
            {/* <CheckboxField
                name="bookmarked"
                label="Bookmarked"
            /> */}

            <DateInputControl
                placeholder="Start Date" 
                name={`startDate`} 
            />

            <DateInputControl 
                placeholder="End Date" 
                name={`endDate`} 
            />

            <CheckboxGroupField
                items={filters.typeName}
                label="Asset Type"
                name="typeName"
            />
    
            <CheckboxGroupField
                items={filters.subTypeName}
                label="Model"
                name="subTypeName"
            />

            <CheckboxGroupField
                items={filters.deptName}
                label="Department"
                name="deptName"
            />

            <CheckboxGroupField
                items={filters.userTag}
                label="User Tag"
                name="userTag"
            />

            <CheckboxGroupField
                items={filters.assetTag}
                label="Asset Tag"
                name="assetTag"
            />

            <CheckboxGroupField
                items={filters.admin}
                label="Admin"
                name="admin"
            />
        </>
    )
};

export default ReminderFilters;