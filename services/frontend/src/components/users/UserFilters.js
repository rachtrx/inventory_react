import React, { useEffect } from 'react';
import { Field, Form, Formik } from 'formik';
import { useContext } from 'react';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import { useItems } from '../../context/ItemsProvider';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import userService from '../../services/UserService';
import { FormControl, FormLabel, HStack, NumberInput, NumberInputField } from '@chakra-ui/react';
import { RangeField } from '../forms/utils/RangeField';
import FilterSidebar from '../utils/FilterSidebar';
import CheckboxField from '../forms/utils/CheckboxField';
import { CheckboxGroupField } from '../forms/utils/CheckboxGroupField';

export default function UserFilters() { // TODO can have external filters from Dashboard

	const { filters } = useItems()

    return (
        <>
            <CheckboxField
                name="bookmarked"
                label="Bookmarked"
            />
            <CheckboxGroupField
                items={filters.deptName}
                label="Department"
                name="deptName"
            />
            <RangeField 
                label="Asset Count"
                range={[0,...filters.assetCount?.map(option => option.value)]} 
                name="assetCount"
            />
            <CheckboxGroupField
                items={filters.userTag}
                label="User Tag"
                name="userTag"
            />
        </>
    )
};
