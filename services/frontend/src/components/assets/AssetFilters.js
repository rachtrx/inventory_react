import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import { useItems } from '../../context/ItemsProvider';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import { useUI } from '../../context/UIProvider';
import assetService from '../../services/AssetService';
import { AssetStatus } from './constants/AssetStatus';
import { Button, Checkbox, CheckboxGroup, Flex, Stack } from '@chakra-ui/react';
import FilterSidebar from '../utils/FilterSidebar';

export default function AssetFilters() { // TODO can have external filters from Dashboard

	const { filters, fetchFilters, setSearchFilters } = useItems()

	useEffect(() => {
        fetchFilters('typeName');
        fetchFilters('subTypeName');
        fetchFilters('vendor');
        fetchFilters('location');
        fetchFilters('age');
        fetchFilters('assetTag');
    }, [fetchFilters]);

  return (
    <Formik initialValues={assetService.defaultFilters} onSubmit={(values) => {
            console.log(values);  
            setSearchFilters(values)
        }}>
        {({ setFieldValue, values }) => (
            <Form>
                <FilterSidebar>
                    <CheckboxGroup
                        value={values.status || []}
                        onChange={(selected) => setFieldValue("status", selected)}
                    >
                        <Stack spacing={2} mb={4}>
                            {Object.values(AssetStatus).map((status) => (
                                <Checkbox key={status} value={status}>
                                    {status}
                                </Checkbox>
                            ))}
                        </Stack>
                    </CheckboxGroup>

                    <MultiSelectFormControl
                        name="typeName"
                        // label="Asset Type"
                        placeholder="Asset Type"
                        initialOptions={filters.typeName}
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
                        initialOptions={filters.subTypeName}
                    />
                    <MultiSelectFormControl
                        name="vendor"
                        // label="Vendor"
                        placeholder="Vendor"
                        initialOptions={filters.vendor}
                    />
                    <MultiSelectFormControl
                        name="location"
                        // label="Location"
                        placeholder="Location"
                        initialOptions={filters.location}
                    />
                    <MultiSelectFormControl
                        name="age"
                        // label="Asset Age"
                        placeholder="Asset Age"
                        initialOptions={filters.age}
                    />
                    <MultiSelectFormControl
                        name="assetTag"
                        // label="Asset Age"
                        placeholder="Tag"
                        initialOptions={filters.assetTag}
                    />
                    <ToggleButton name="bookmarked" label="Bookmarked" />
                </FilterSidebar>
            </Form>
        )}
    </Formik>
  );
};
