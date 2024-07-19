import React from 'react';
import { Form, Formik } from 'formik';
import { useGlobal } from '../../context/GlobalProvider';
import FilterContainer from '../utils/FilterContainer';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';

export default function AssetFilters() { // TODO can have external filters from Dashboard

	const { assetFilters, setFilters, setPagination } = useGlobal()

	const handleSetFilters = (newFilters) => {
		setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
		setPagination({ page: 1, pageSize: 10, totalItems: 0 })
	}

	const onSubmit = (values, actions) => {
		handleSetFilters(values);
		actions.setSubmitting(false);
	};

	const initialValues = {
    "asset-type": '',
    "model-name": '',
    "vendor": '',
    "status": '',
    "location": '',
    "asset-age": '',
    "serial-number": '',
    "asset-tag": ''
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
        <Form>
            <FilterContainer>
                <MultiSelectFormControl
                    name="asset-type"
                    // label="Asset Type"
                    placeholder="Asset Type"
                    options={assetFilters.assetType}
                />
                <MultiSelectFormControl
                    name="status"
                    // label="Status"
                    placeholder="Status"
                    options={assetFilters.status}
                    isMulti={true}
                />
                <InputFormControl
                    name="asset-tag"
                    // label="Asset Tag"
                    placeholder="Asset Tag"
                />
                <InputFormControl
                    name="serial-number"
                    // label="Serial Number"
                    placeholder="Serial Number"
                />
                <MultiSelectFormControl
                    name="model-name"
                    // label="Specific Model"
                    placeholder="Specific Model"
                    isMulti={true}
                />
                <MultiSelectFormControl
                    name="vendor"
                    // label="Vendor"
                    placeholder="Vendor"
                    options={assetFilters.vendor}
                    isMulti={true}
                />
                <MultiSelectFormControl
                    name="location"
                    // label="Location"
                    placeholder="Location"
                    options={assetFilters.location}
                />
                <MultiSelectFormControl
                    name="asset-age"
                    // label="Asset Age"
                    placeholder="Asset Age"
                    options={assetFilters.age}
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterContainer>
        </Form>
    </Formik>
  );
};
