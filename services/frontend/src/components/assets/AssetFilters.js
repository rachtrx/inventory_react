import React from 'react';
import { Form, Formik } from 'formik';
import { useAsset } from '../../context/AssetProvider';
import FilterContainer from '../FilterContainer';
import InputFormControl from '../../pages/components/forms/utils/InputFormControl';
import SelectFormControl from '../../pages/components/forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';

export default function AssetFilters() { // TODO can have external filters from Dashboard

	const { filters, setFilters, setPagination } = useAsset()

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
                <SelectFormControl
                    name="asset-type"
                    // label="Asset Type"
                    placeholder="Asset Type"
                    options={filters?.assetType?.map(type => ({ label: type, value: type })) ?? []}
                />
                <SelectFormControl
                    name="status"
                    // label="Status"
                    placeholder="Status"
                    options={[
                        { label: "Available", value: "available" },
                        { label: "On Loan", value: "loaned" }
                    ]}
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
                <InputFormControl
                    name="model-name"
                    // label="Specific Model"
                    placeholder="Specific Model"
                />
                <SelectFormControl
                    name="vendor"
                    // label="Vendor"
                    placeholder="Vendor"
                    options={filters?.vendor?.map(vendor => ({ label: vendor, value: vendor })) ?? []}
                />
                <SelectFormControl
                    name="location"
                    // label="Location"
                    placeholder="Location"
                    options={filters?.location?.map(location => ({ label: location, value: location })) ?? []}
                />
                <SelectFormControl
                    name="asset-age"
                    // label="Asset Age"
                    placeholder="Asset Age"
                    options={filters?.age?.map(age => ({ label: age, value: age })) ?? []}
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterContainer>
        </Form>
    </Formik>
  );
};
