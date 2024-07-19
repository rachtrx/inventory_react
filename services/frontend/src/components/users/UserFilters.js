import React from 'react';
import { Form, Formik } from 'formik';
import { useContext } from 'react';
import FilterContainer from '../utils/FilterContainer';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { useGlobal } from '../../context/GlobalProvider';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';

export default function UserFilters() { // TODO can have external filters from Dashboard

	const { filters, setFilters, setPagination } = useGlobal()

	const handleSetFilters = (newFilters) => {
		setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
		setPagination({ page: 1, pageSize: 10, totalItems: 0 })
	}

	const onSubmit = (values, actions) => {
		handleSetFilters(values);
		actions.setSubmitting(false);
	};

	const initialValues = {
    "department": '',
    "asset-count": '',
    "user-name": '',
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
        <Form>
            <FilterContainer>
                <MultiSelectFormControl
                    name="department"
                    // label="Department"
                    placeholder="Department"
                    options={filters?.department?.map(dept => ({ label: dept, value: dept })) ?? []}
                />
                <MultiSelectFormControl
                    name="asset-count"
                    // label="Number of Assets"
                    placeholder="Number of Assets"
                    options={filters?.assetCount?.map(count => ({ label: count, value: count })) ?? []}
                />
                <InputFormControl
                    name="user-name"
                    // label="User Name"
                    placeholder="User Name"
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterContainer>
        </Form>
    </Formik>
  );
};
