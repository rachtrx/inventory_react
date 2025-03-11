import React, { useEffect } from 'react';
import { Field, Form, Formik } from 'formik';
import { useContext } from 'react';
import InputFormControl from '../forms/utils/InputFormControl';
import SelectFormControl from '../forms/utils/SelectFormControl';
import ToggleButton from '../buttons/ToggleButton';
import { useItems } from '../../context/ItemsProvider';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import userService from '../../services/UserService';
import { FormControl, FormLabel, HStack, NumberInput, NumberInputField } from '@chakra-ui/react';
import { RangeField } from '../forms/utils/RangeField';
import FilterSidebar from '../utils/FilterSidebar';

export default function UserFilters() { // TODO can have external filters from Dashboard

	const { filters, fetchFilters, onSubmit } = useItems()

	useEffect(() => {
        fetchFilters('deptName');
        fetchFilters('assetCount');
        fetchFilters('userTag');
    }, [fetchFilters]);

    return (
        <Formik initialValues={userService.defaultFilters} onSubmit={onSubmit}>
            <Form>
                <FilterSidebar>
                    <MultiSelectFormControl
                        name="deptName"
                        // label="Department"
                        placeholder="Department"
                        initialOptions={filters.deptName}
                    />
                    <RangeField 
                        label="Asset Count"
                        range={filters.assetCount} 
                        name="assetCount"
                    />

                    {/* <MultiSelectFormControl
                        name="assetCount"
                        // label="Number of Assets"
                        placeholder="Number of Assets"
                        initialOptions={filters.assetCount}
                    /> */}
                    <InputFormControl
                        name="userName"
                        // label="User Name"
                        placeholder="User Name"
                    />
                    <MultiSelectFormControl
                        name="userTag"
                        // label="Number of Assets"
                        placeholder="Tag"
                        initialOptions={filters.userTag}
                    />
                    <ToggleButton name="bookmarked" label="Bookmarked" />
                </FilterSidebar>
            </Form>
        </Formik>
    );
    };
