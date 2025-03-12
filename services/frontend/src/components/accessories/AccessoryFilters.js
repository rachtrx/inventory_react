import React, { useEffect } from 'react';
import { Form, Formik } from 'formik';
import { useContext } from 'react';
import ToggleButton from '../buttons/ToggleButton';
import { useItems } from '../../context/ItemsProvider';
import { MultiSelectFormControl } from '../forms/utils/SelectFormControl';
import accessoryService from '../../services/AccessoryService';
import FilterSidebar from '../utils/FilterSidebar';
import InputFormControl from '../forms/utils/InputFormControl';

export default function AccessoryFilters() { // TODO can have external filters from Dashboard

    // console.log(filters.accessoryName);

  return (
    <>
        <InputFormControl
            name="accessoryName"
            label="Name"
            placeholder="Name"
        />
        {/* <ToggleButton name="bookmarked" label="Bookmarked" /> */}
    </>
  );
};
