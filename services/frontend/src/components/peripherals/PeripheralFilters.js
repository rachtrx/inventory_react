import React, { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { useContext } from 'react';
import FilterContainer from '../utils/FilterContainer';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { useItems } from '../../context/ItemsProvider';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import peripheralService from '../../services/PeripheralService';

export default function PeripheralFilters() { // TODO can have external filters from Dashboard

    
	const { filters, fetchFilters, onSubmit } = useItems()
	useEffect(() => {
        fetchFilters('peripheralName');
    }, [fetchFilters]);

    console.log(filters.peripheralName);

  return (
    <Formik initialValues={peripheralService.defaultFilters} onSubmit={onSubmit}>
        <Form>
            <FilterContainer>
                <MultiSelectFormControl
                    name="peripheralName"
                    // label="name"
                    placeholder="Name"
                    options={filters.peripheralName}
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterContainer>
        </Form>
    </Formik>
  );
};
