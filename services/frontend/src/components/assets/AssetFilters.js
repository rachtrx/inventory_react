import React, { useEffect, useState } from 'react';
import { Form, Formik, useFormikContext } from 'formik';
import { useItems } from '../../context/ItemsProvider';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import { useUI } from '../../context/UIProvider';
import assetService from '../../services/AssetService';
import { AssetStatus } from './utils/AssetStatus';
import { Button, Checkbox, CheckboxGroup, Flex, Stack } from '@chakra-ui/react';
import FilterSidebar from '../utils/FilterSidebar';
import { CheckboxGroupField } from '../forms/utils/CheckboxGroupField';
import { RangeField } from '../forms/utils/RangeField';
import CheckboxField from '../forms/utils/CheckboxField';

export default function AssetFilters() { // TODO can have external filters from Dashboard

	const { filters } = useItems();

  return Object.keys(filters)?.length ? (
    <>
        <CheckboxField
            name="bookmarked"
            label="Bookmarked"
        />

        <CheckboxGroupField
            items={Object.values(AssetStatus).map(status => ({
                label: status,
                value: status
            }))}
            label="Status"
            name="status"
        />
        <CheckboxGroupField
            items={filters.typeName}
            label="Asset Type"
            name="typeName"
        />

        <CheckboxGroupField
            items={filters.subTypeName}
            label="Model"
            name="subTypeName"
        />

        <CheckboxGroupField
            items={filters.vendor}
            label="Vendor"
            name="vendor"
        />

        <CheckboxGroupField
            items={filters.location}
            label="Location"
            name="location"
        />

        <RangeField
            name="age"
            label="Asset Age"
            range={filters.age?.map(option => option.value)}
        />

        <CheckboxGroupField
            items={filters.assetTag}
            label="Asset Tag"
            name="assetTag"
        />
    </>
  ) : <></>;
};
