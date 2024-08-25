import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { Field, useField, useFormikContext } from 'formik';
import Select, { components } from 'react-select';
import { Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import useDebounce from '../../../hooks/useDebounce';
import { useUI } from '../../../context/UIProvider';

const withSelect = (Component) => ({
  name,
  label,
  secondaryFieldsMeta = null,
  options: initialOptions = [],
  isMulti = false,
  hideSelectedOptions = false,
  handleChangeCallback = null,
  warning = null,
  children,
  ...props
}) => {
  const [{ value }, meta, { setValue, setTouched }] = useField(name);
  const [options, setOptions] = useState(initialOptions);
  const { setFieldValue } = useFormikContext();
  
  const handleChange = useCallback(
    (selected) => {
      if (secondaryFieldsMeta && Array.isArray(secondaryFieldsMeta)) {
        secondaryFieldsMeta.forEach(({ name, attr }) => {
          setFieldValue(name, selected?.[attr] ? selected[attr] : '');
        });
      }
      if (handleChangeCallback) {
        handleChangeCallback(selected);
      }

      let newValue;
      if (isMulti) {
        newValue = (selected || []).map((option) => option.value.trim());
      } else {
        newValue = selected?.value.trim() || '';
      }

      setValue(newValue);
      setTouched(true);
    },
    [secondaryFieldsMeta, setFieldValue, setTouched, setValue, isMulti, handleChangeCallback]
  );

  const selectedOption = useMemo(() => {
    if (isMulti) {
      return options.filter((option) => value.includes(option.value));
    } else {
      return options.find((option) => option.value === value) || null;
    }
  }, [value, options, isMulti]);

  return (
    <FormControl id={name} isInvalid={meta.touched && !!meta.error}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Flex alignItems="center" gap={4}>
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

const withCreate = (Component) => ({
  name,
  options = [],
  setOptions,
  isMulti = false,
  handleChangeCallback = null,
  ...props
}) => {
  const [{ value }, , { setValue }] = useField(name);

  const handleCreateOption = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue, __isNew__: true };
    console.log('creating new option');
    
    setOptions((prevOptions) => [...prevOptions, newOption]);
    
    if (isMulti) {
      setValue([...value, inputValue]);
    } else {
      setValue(inputValue);
    }

    // Optionally trigger the change callback
    if (handleChangeCallback) handleChangeCallback(newOption);
  };

  return (
    <Component
      {...props}
      name={name}
      options={options}
      setOptions={setOptions}
      handleChangeCallback={handleChangeCallback}
      onCreateOption={handleCreateOption}
    />
  );
};

const withSearch = (Component) => ({
  name,
  options,
  setOptions,
  searchFn,
  isMulti = false,
  handleChangeCallback = null,
  onCreateOption = null,
  ...props
}) => {
  
  const [{ value }, meta, { setValue, setTouched }] = useField(name);
  const { handleError } = useUI();

  useEffect(() => {
    if (isMulti || !(value && !meta.touched)) return;

    const fetchData = async () => {
      try {
        // console.log(`Value in search fn: ${value}`);
        const response = await searchFn(value);
        const data = response.data;

        let option;

        setTouched(true);

        if (data.length === 1) {
          option = data[0];
          setValue(option.value.trim());
        } else if (onCreateOption) {
          option = {value, label: value, __isNew__: true};
          onCreateOption(option);
          setValue(value.trim());
        } else return;

        if (handleChangeCallback) handleChangeCallback(option);
        setOptions([option]);
      } catch (error) {
        handleError(error);
      }
    };

    fetchData();
  }, [value, meta, searchFn, setValue, setTouched, isMulti, handleError, handleChangeCallback, onCreateOption, setOptions]);

  const handleSearch = useCallback(
    async (inputValue) => {
      try {
        if (inputValue === '') return;
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
      handleChangeCallback={handleChangeCallback}
    />
  );
};

const EnhancedSelect = withSelect(Select);
const EnhancedCreatableSelect = withSelect(withCreate(CreatableSelect));
const SearchSelect = withSelect(withSearch(Select));
const SearchCreatableSelect = (withSelect(withCreate(withSearch(CreatableSelect))));

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