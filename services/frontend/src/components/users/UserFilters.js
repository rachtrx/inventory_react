import React, { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { useContext } from 'react';
import FilterContainer from '../utils/FilterContainer';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { useItems } from '../../context/ItemsProvider';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import userService from '../../services/UserService';

export default function UserFilters() { // TODO can have external filters from Dashboard

	const { filters, fetchFilters, onSubmit } = useItems()

	useEffect(() => {
        fetchFilters('department');
        fetchFilters('assetCount');
    }, [fetchFilters]);

  return (
    <Formik initialValues={userService.defaultFilters} onSubmit={onSubmit}>
        <Form>
            <FilterContainer>
                <MultiSelectFormControl
                    name="department"
                    // label="Department"
                    placeholder="Department"
                    options={filters.department}
                />
                <MultiSelectFormControl
                    name="assetCount"
                    // label="Number of Assets"
                    placeholder="Number of Assets"
                    options={filters.assetCount}
                />
                <InputFormControl
                    name="name"
                    // label="User Name"
                    placeholder="User Name"
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterContainer>
        </Form>
    </Formik>
  );
};
