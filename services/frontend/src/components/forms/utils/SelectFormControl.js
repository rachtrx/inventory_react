import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Field, useField } from 'formik';
import Select, { components } from 'react-select';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import { actionTypes, updateOptions, useFormModal } from '../../../context/ModalProvider';
import CreatableSelect from 'react-select/creatable';

const withSelect = (Component) => ({ name, label, options = [], isMulti = false, updateChangeFn=null, hideSelectedOptions=false, ...props }) => {
  const [, meta, { setValue, setTouched }] = useField(name);
  const selectRef = useRef();

  // Formik does not set the entire option as a value but rather strings/numbers. React-Select expects it to be null, Object, or [Objects]
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = useCallback((value) => {
    console.log(value);
    if (updateChangeFn) {
      updateChangeFn(value);
    }
    const newValue = isMulti ? (value || []).map(v => v.value) : value?.value || '';
    console.log("New value set:", newValue);
    setValue(newValue);
    setSelectedOption(value);
    setTouched(true);
  }, [setTouched, setValue, isMulti, updateChangeFn]);

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
        value={selectedOption}
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