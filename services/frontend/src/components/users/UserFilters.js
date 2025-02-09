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
        fetchFilters('deptName');
        fetchFilters('assetCount');
        fetchFilters('tag');
    }, [fetchFilters]);

  return (
    <Formik initialValues={userService.defaultFilters} onSubmit={onSubmit}>
        <Form>
            <FilterContainer>
                <MultiSelectFormControl
                    name="deptName"
                    // label="Department"
                    placeholder="Department"
                    initialOptions={filters.deptName}
                />
                <MultiSelectFormControl
                    name="assetCount"
                    // label="Number of Assets"
                    placeholder="Number of Assets"
                    initialOptions={filters.assetCount}
                />
                <InputFormControl
                    name="userName"
                    // label="User Name"
                    placeholder="User Name"
                />
                <MultiSelectFormControl
                    name="tag"
                    // label="Number of Assets"
                    placeholder="Tag"
                    initialOptions={filters.tag}
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterContainer>
        </Form>
    </Formik>
  );
};
