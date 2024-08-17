import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Field, useField } from 'formik';
import Select, { components } from 'react-select';
import { FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/react';
import { actionTypes, updateOptions, useFormModal } from '../../../context/ModalProvider';
import CreatableSelect from 'react-select/creatable';
import peripheralService from '../../../services/PeripheralService';
import useDebounce from '../../../hooks/useDebounce';

const withSelect = (Component) => ({ name, label, options = [], isMulti = false, hideSelectedOptions=false, callback=null, warning=null, ...props }) => {
  const [, meta, { setValue, setTouched }] = useField(name);
  const selectRef = useRef();

  // Formik does not set the entire option as a value but rather strings/numbers. React-Select expects it to be null, Object, or [Objects]
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = useCallback((value) => {
    console.log(value);
    if (callback) {
      callback(value);
    }
    const newValue = isMulti ? (value || []).map(v => v.value.trim()) : value?.value.trim() || '';
    console.log("New value set:", newValue);
    setValue(newValue);
    setSelectedOption(value);
    setTouched(true);
  }, [setTouched, setValue, isMulti, callback]);
  
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
      {!meta.error && warning && <FormHelperText color="orange.400">{warning}</FormHelperText>}
    </FormControl>
  );
};

const EnhancedSelect = withSelect(Select);
export const SingleSelectFormControl = (props) => {
  return (
    <EnhancedSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};

export const MultiSelectFormControl = (props) => {
  return (
    <EnhancedSelect 
      {...props}
      isMulti={true}
      closeMenuOnSelect={false}
    />
  );
};

const EnhancedCreatableSelect = withSelect(CreatableSelect);
export const CreatableSingleSelectFormControl = (props) => {
  return (
    <EnhancedCreatableSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};

export const CreatableMultiSelectFormControl = (props) => {
  return (
    <EnhancedCreatableSelect 
      {...props}
      isMulti={true}
      hideSelectedOptions={true}
    />
  );
};

export const SearchFormControl = function({ name, searchFn, defaultOptions = [], ...props }) {
  const [options, setOptions] = useState(defaultOptions || []);
  const debouncedSearch = useDebounce((value) => {
    (async () => {
      try {
        const response = await searchFn(value);
        setOptions(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setOptions([{ label: "Error fetching data", value: '', isDisabled: true }]);
      }
    })();
  }, 500);

  const handleInputChange = (value) => {
    debouncedSearch(value);
  };

  return (
    <CreatableSingleSelectFormControl
      {...props}
      name={name}
      options={options && options.length > 0 ? options : [{ label: "No results found", value: '', isDisabled: true }]}
      onInputChange={handleInputChange}
    />
  );
};

