import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Field, useField } from 'formik';
import Select, { components } from 'react-select';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { actionTypes, updateOptions, useFormModal } from '../../../context/ModalProvider';
import CreatableSelect from 'react-select/creatable';

const withSelect = (Component) => ({ name, label, options = [], isMulti = false, updateChangeFn=null, hideSelectedOptions=false, ...props }) => {
  const [{ value }, meta, { setValue, setTouched }] = useField(name);
  const selectRef = useRef();

  const handleChange = useCallback((value, actionMeta) => {
    console.log("Action: ", actionMeta.action);
    console.log("Value: ", value);
    if (updateChangeFn) {
      console.log(value);
      updateChangeFn(value);
    }

    const newValue = isMulti ? (value || []).map(v => v.value) : value?.value || '';
    console.log("New value set:", newValue);
    setValue(newValue);
    setTouched(true);
  }, [setValue, setTouched, isMulti, updateChangeFn]);

  const getValue = useCallback(() => {
    if (isMulti) {
      const selectedOptions = new Set(value);
      return options ? options.filter(option => selectedOptions.has(option.value)) : [];
    }

    console.log(options.find(option => option.value === value));
    return options ? options.find(option => option.value === value) : null;
  }, [value, options, isMulti]);


  return (
    <FormControl id={name} isInvalid={meta.touched && !!meta.error}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Component
        ref={selectRef}
        classNamePrefix="react-select"
        name={name}
        options={options}
        isMulti={isMulti}
        onChange={handleChange}
        value={getValue()} // Calling the function directly here
        hideSelectedOptions={hideSelectedOptions}
        isSearchable
        {...props}
      />
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};

const SingleSelect = withSelect(Select);
export const SingleSelectFormControl = (props) => {
  const [displayValue, setDisplayValue] = useState(true);

  const handleMenuOpen = useCallback(() => setDisplayValue(false), []);
  const handleMenuClose = useCallback(() => setDisplayValue(true), []);

  return (
    <SingleSelect 
      {...props}
      onMenuOpen={handleMenuOpen}
      onMenuClose={handleMenuClose}
      components={{
        SingleValue: (props) => displayValue ? <components.SingleValue {...props} /> : null,
      }}
      isMulti={false}
    />
  );
};

const MultiSelect = withSelect(Select);
export const MultiSelectFormControl = (props) => {
  return (
    <MultiSelect 
      {...props}
      isMulti={true}
    />
  );
};

const CustomSelect = withSelect(CreatableSelect);
export const CustomMultiSelectFormControl = ({updateChangeFn=null, name, options, setOptions, ...props}) => {

  return (
    <CustomSelect 
      {...props}
      name={name}
      isMulti={true}
      hideSelectedOptions={true}
      options={options}
      setOptions={setOptions}
      updateChangeFn={updateChangeFn}
    />
  );
};