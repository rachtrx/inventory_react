import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { Field, useField, useFormikContext } from 'formik';
import Select, { components } from 'react-select';
import { Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import useDebounce from '../../../hooks/useDebounce';
import { useUI } from '../../../context/UIProvider';
import { ResponsiveText } from '../../utils/ResponsiveText';

const withSelect = (Component, isCreatable) => ({
  name,
  label,
  updateFields = null, // function
  initialOptions = [],
  isMulti = false,
  hideSelectedOptions = false,
  warning = null,
  children,
  ...props
}) => {
  const [{ value }, meta, { setValue, setTouched }] = useField(name);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState(initialOptions); // TODO maybe create branch to test passing this down as props

  useEffect(() => {
    console.log(options.length);
    if (options.length === 0 && initialOptions.length !== 0) {
      setOptions(initialOptions);
    }
  }, [initialOptions, options]);
  
  const handleChange = useCallback(
    (selected) => {
      if (isMulti) {
        const selectedValues = (selected || []).map((option) => option.value.trim());
        const currentValues = value.map((val) => val.trim());
        if (JSON.stringify(selectedValues) === JSON.stringify(currentValues)) {
          return;
        }
      } else {
        console.log(selected?.value);
        console.log(value);
        if (selected?.value.trim() === value.trim()) {
          return;
        }
      }

      console.log(selected);
      if (updateFields) updateFields(selected);

      let newValue;
      if (isMulti) {
        newValue = (selected || []).map((option) => option.value.trim());
      } else {
        newValue = selected?.value.trim() || '';
      }

      //TODO what is this for actually?
      // const newOptions = isMulti ? selected : [selected];
      // newOptions.forEach((option) => { // TODO duplicated?
      //   if (option && !options.some((o) => o.value === option.value)) {
      //     setOptions((prevOptions) => [...prevOptions, { value: option.value, label: option.label }]);
      //   }
      // });
      
      console.log(newValue);
      setValue(newValue);
      setTouched(true);
    },
    [updateFields, value, setValue, setTouched, isMulti]
  );

  useEffect(() => {
    let option;

    // Find the selected option based on whether it's a multi-select or single select
    console.log(options);
    console.log(value);
    if (isMulti) {
      option = options.filter((option) => value?.map(val => val.trim()).includes(option?.value));
    } else {
      option = options.find((option) => option?.value === value.trim()) || null;
    }
    console.log(option);
    console.log(meta.touched);

    // Handle the case where it's a creatable select and the option is not found
    if (!option && isCreatable && value) { // TODO warning not appearing because technically shouldnt set ID
      console.log(value);
      option = { value: value.trim(), label: value.trim() };
      setOptions((prevOptions) => [...prevOptions, option]); // Add the new creatable option
    }

    setSelectedOption(option); // Set the selected option (whether found or newly created)
    
  }, [value, options, isMulti, meta.touched]);

  return (
    <FormControl id={name} isInvalid={meta.touched && !!meta.error}>
      {label && <FormLabel htmlFor={name}>
        <ResponsiveText>{label}</ResponsiveText>
      </FormLabel>}
      <Flex alignItems="center">
        <Component
          classNamePrefix="react-select"
          name={name}
          options={options}
          setOptions={setOptions}
          isMulti={isMulti}
          onChange={handleChange}
          value={selectedOption}
          hideSelectedOptions={hideSelectedOptions}
          isSearchable
          {...props}
          styles={{
            container: (provided) => ({
              ...provided,
              width: '100%',
            }),
          }}
        />
        {children}
      </Flex>
      <FormErrorMessage>{meta.error}</FormErrorMessage>
      {!meta.error && warning && <FormHelperText color="orange.400">{warning}</FormHelperText>}
    </FormControl>
  );
};

const withSearch = (Component) => ({
  name,
  options,
  setOptions,
  searchFn,
  isMulti = false,
  ...props
}) => {
  const { handleError } = useUI();

  const handleSearch = useCallback(
    async (inputValue) => {
      try {
        if (inputValue === '') return;
        console.log(`input value detected: ${inputValue}`);
        const response = await searchFn(inputValue);
        setOptions(response.data);
      } catch (error) {
        handleError(error);
      }
    },
    [searchFn, handleError, setOptions]
  );

  const debouncedSearch = useDebounce(handleSearch, 500);

  const handleInputChange = (inputValue) => {
    debouncedSearch(inputValue);
  };

  return (
    <Component
      {...props}
      name={name}
      isMulti={isMulti}
      options={options}
      onInputChange={handleInputChange}
    />
  );
};

const EnhancedSelect = withSelect(Select);
const EnhancedCreatableSelect = withSelect(CreatableSelect, true);
const SearchSelect = withSelect(withSearch(Select));
const SearchCreatableSelect = withSelect(withSearch(CreatableSelect), true);

// Single Select without Search
export const SingleSelectFormControl = (props) => {
  return (
    <EnhancedSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};

// Multi Select without Search
export const MultiSelectFormControl = (props) => {
  return (
    <EnhancedSelect 
      {...props}
      isMulti={true}
      closeMenuOnSelect={false}
    />
  );
};

// Creatable Single Select without Search
export const CreatableSingleSelectFormControl = (props) => {
  return (
    <EnhancedCreatableSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};

// Creatable Multi Select without Search
export const CreatableMultiSelectFormControl = (props) => {
  return (
    <EnhancedCreatableSelect 
      {...props}
      isMulti={true}
      hideSelectedOptions={true}
    />
  );
};

// Single Select with Search
export const SearchSingleSelectFormControl = (props) => {
  return (
    <SearchSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};

// Multi Select with Search
export const SearchMultiSelectFormControl = (props) => {
  return (
    <SearchSelect 
      {...props}
      isMulti={true}
      closeMenuOnSelect={false}
    />
  );
};

// Creatable Single Select with Search
export const SearchCreatableSingleSelectFormControl = (props) => {
  
  return (
    <SearchCreatableSelect 
      {...props}
      isClearable={true}
      isMulti={false}
    />
  );
};

// Creatable Multi Select with Search
export const SearchCreatableMultiSelectFormControl = (props) => {
  return (
    <SearchCreatableSelect 
      {...props}
      isMulti={true}
      hideSelectedOptions={true}
    />
  );
};