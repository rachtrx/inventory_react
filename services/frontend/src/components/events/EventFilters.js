import React, { useEffect } from 'react';
import InputFormControl from '../forms/utils/InputFormControl';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import { Form, Formik } from 'formik';
import { useItems } from '../../context/ItemsProvider';
import eventService from '../../services/EventService';
import DateInputControl from '../forms/utils/DateInputControl';
import { FormType } from '../../context/ModalProvider';
import ToggleButton from '../buttons/ToggleButton';
import FilterSidebar from '../utils/FilterSidebar';
import { CheckboxGroupField } from '../forms/utils/CheckboxGroupField';
import CheckboxField from '../forms/utils/CheckboxField';


const EventFilters = () => {

    const { filters } = useItems();

    return (
        <>
            <CheckboxField
                name="bookmarked"
                label="Bookmarked"
            />

            <DateInputControl
                placeholder="Start Date" 
                name={`startDate`} 
            />

            <DateInputControl 
                placeholder="End Date" 
                name={`endDate`} 
            />

            <CheckboxGroupField
                name="eventType"
                label="Event Type"
                items={
                    [
                        {'label': 'Loan', 'value': FormType.LOAN},
                        {'label': 'Return', 'value': FormType.RETURN},
                        {'label': 'Reservation', 'value': FormType.RESERVE},
                        {'label': 'Add Asset', 'value': FormType.ADD_ASSET},
                        {'label': 'Del Asset', 'value': FormType.DEL_ASSET},
                        {'label': 'Add User', 'value': FormType.ADD_USER},
                        {'label': 'Del User', 'value': FormType.DEL_USER},
                        {'label': 'Update Accessory', 'value': FormType.UPDATE_ACC},
                        {'label': 'Tag Asset', 'value': FormType.TAG_ASSET},
                        {'label': 'Untag Asset', 'value': FormType.UNTAG_ASSET},
                        {'label': 'Tag User', 'value': FormType.TAG_USER},
                        {'label': 'Untag User', 'value': FormType.UNTAG_USER},
                    ]
                }
            />

            <CheckboxGroupField
                items={filters.typeName}
                label="Asset Type"
                name="typeName"
            />

            <InputFormControl
                name="serialNumber"
                label="Serial Number"
                placeholder="Serial Number"
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

            <InputFormControl
                name="userName"
                label="User Name"
                placeholder="User Name"
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

export default EventFilters;