import React, { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { useContext } from 'react';
import FilterContainer from '../utils/FilterContainer';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { useItems } from '../../context/ItemsProvider';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import accessoryService from '../../services/AccessoryService';

export default function AccessoryFilters() { // TODO can have external filters from Dashboard

    
	const { filters, fetchFilters, onSubmit } = useItems()
	useEffect(() => {
        fetchFilters('accessoryName');
    }, [fetchFilters]);

    console.log(filters.accessoryName);

  return (
    <Formik initialValues={accessoryService.defaultFilters} onSubmit={onSubmit}>
        <Form>
            <FilterContainer>
                <MultiSelectFormControl
                    name="accessoryName"
                    // label="name"
                    placeholder="Name"
                    options={filters.accessoryName}
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterContainer>
        </Form>
    </Formik>
  );
};
