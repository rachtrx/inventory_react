import React, { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { useContext } from 'react';
import ToggleButton from '../buttons/ToggleButton';
import { useItems } from '../../context/ItemsProvider';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import accessoryService from '../../services/AccessoryService';
import FilterSidebar from '../utils/FilterSidebar';

export default function AccessoryFilters() { // TODO can have external filters from Dashboard

    
	const { filters, fetchFilters, onSubmit } = useItems()
	useEffect(() => {
        fetchFilters('accessoryName');
    }, [fetchFilters]);

    // console.log(filters.accessoryName);

  return (
    <Formik initialValues={accessoryService.defaultFilters} onSubmit={onSubmit}>
        <Form>
            <FilterSidebar>
                <MultiSelectFormControl
                    name="accessoryName"
                    // label="name"
                    placeholder="Name"
                    initialOptions={filters.accessoryName}
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterSidebar>
        </Form>
    </Formik>
  );
};
