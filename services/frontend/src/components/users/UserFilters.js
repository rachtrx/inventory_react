import React from 'react';
import { Form, Formik } from 'formik';
import { useContext } from 'react';
import FilterContainer from '../FilterContainer';
import InputFormControl from '../../pages/components/forms/utils/InputFormControl';
import SelectFormControl from '../../pages/components/forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { useUser } from '../../context/UserProvider';

export default function UserFilters() { // TODO can have external filters from Dashboard

	const { filters, setFilters, setPagination } = useUser()

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
                <SelectFormControl
                    name="department"
                    // label="Department"
                    placeholder="Department"
                    options={filters?.department?.map(dept => ({ label: dept, value: dept })) ?? []}
                />
                <SelectFormControl
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
