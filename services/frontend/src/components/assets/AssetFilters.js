import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import { useItems } from '../../context/ItemsProvider';
import FilterContainer from '../utils/FilterContainer';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import { useUI } from '../../context/UIProvider';
import assetService from '../../services/AssetService';

export default function AssetFilters() { // TODO can have external filters from Dashboard

	const { filters, fetchFilters, onSubmit } = useItems()

	useEffect(() => {
        fetchFilters('typeName');
        fetchFilters('subTypeName');
        fetchFilters('vendor');
        fetchFilters('location');
        fetchFilters('age');
    }, [fetchFilters]);

  return (
    <Formik initialValues={assetService.defaultFilters} onSubmit={onSubmit}>
        <Form>
            <FilterContainer>
                <MultiSelectFormControl
                    name="typeName"
                    // label="Asset Type"
                    placeholder="Asset Type"
                    options={filters.typeName}
                />
                <MultiSelectFormControl
                    name="status"
                    // label="Status"
                    placeholder="Status"
                    options={
                        [
                            {'label': 'Reserved', 'value': 'Reserved'},
                            {'label': 'Available', 'value': 'Available'},
                            {'label': 'Unavailable', 'value': 'Unavailable'},
                            {'label': 'Condemned', 'value': 'Condemned'},
                        ]
                    }
                />
                <InputFormControl
                    name="assetTag"
                    // label="Asset Tag"
                    placeholder="Asset Tag"
                />
                <InputFormControl
                    name="serialNumber"
                    // label="Serial Number"
                    placeholder="Serial Number"
                />
                <MultiSelectFormControl
                    name="subTypeName"
                    // label="Specific Model"
                    placeholder="Specific Model"
                    options={filters.subTypeName}
                />
                <MultiSelectFormControl
                    name="vendor"
                    // label="Vendor"
                    placeholder="Vendor"
                    options={filters.vendor}
                />
                <MultiSelectFormControl
                    name="location"
                    // label="Location"
                    placeholder="Location"
                    options={filters.location}
                />
                <MultiSelectFormControl
                    name="age"
                    // label="Asset Age"
                    placeholder="Asset Age"
                    options={filters.age}
                />
                <ToggleButton name="bookmarked" label="Bookmarked" />
            </FilterContainer>
        </Form>
    </Formik>
  );
};
