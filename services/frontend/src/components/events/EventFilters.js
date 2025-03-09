import React, { useEffect } from 'react';
import BookmarkFilter from '../forms/utils/BookmarkFilter';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl, { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import { Form, Formik } from 'formik';
import FilterContainer from '../utils/FilterContainer';
import { useItems } from '../../context/ItemsProvider';
import eventService from '../../services/EventService';
import DateInputControl from '../forms/utils/DateInputControl';
import { FormType } from '../../context/ModalProvider';
import ToggleButton from '../buttons/ToggleButton';


const EventFilters = () => {

    const { filters, fetchFilters, onSubmit } = useItems();

    useEffect(() => {
        fetchFilters('typeName');
        fetchFilters('subTypeName');
        fetchFilters('deptName');
        fetchFilters('assetTag');
        fetchFilters('userTag');
        fetchFilters('admin');
    }, [fetchFilters]);

    return (
        <Formik initialValues={eventService.defaultFilters} onSubmit={onSubmit}>
            <Form>
                <FilterContainer>
				    <DateInputControl
                        placeholder="Start Date" 
                        name={`startDate`} 
                    />

                    <DateInputControl 
                        placeholder="End Date" 
                        name={`endDate`} 
                    />

                    <MultiSelectFormControl
                        name="eventType"
                        initialOptions={
                            [
                                {'label': 'Loan', 'value': FormType.LOAN},
                                {'label': 'Return', 'value': FormType.RETURN},
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

                    <MultiSelectFormControl
                        name="typeName"
                        // label="Asset Type"
                        placeholder="Asset Type"
                        initialOptions={filters.typeName}
                    />

                    <MultiSelectFormControl
                        name="subTypeName"
                        // label="Specific Model"
                        placeholder="Specific Model"
                        initialOptions={filters.subTypeName}
                    />

                    <InputFormControl
                        name="serialNumber"
                        // label="Serial Number"
                        placeholder="Serial Number"
                    />

                    <MultiSelectFormControl
                        name="deptName"
                        // label="Department"
                        placeholder="Department"
                        initialOptions={filters.deptName}
                    />

                    <MultiSelectFormControl
                        name="userName"
                        // label="Username"
                        placeholder="Username"
                    />

                    <MultiSelectFormControl
                        name="userTag"
                        placeholder="User Tag"
                        initialOptions={filters.userTag}
                    />

                    <MultiSelectFormControl
                        name="assetTag"
                        placeholder="Asset Tag"
                        initialOptions={filters.assetTag}
                    />

                    <MultiSelectFormControl
                        name="admin"
                        placeholder="Admin"
                        initialOptions={filters.admin}
                    />

                    <ToggleButton name="bookmarked" label="Bookmarked" />
                </FilterContainer>
            </Form>
        </Formik>
    )
};

export default EventFilters;