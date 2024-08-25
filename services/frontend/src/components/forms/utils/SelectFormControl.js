import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { Field, useField, useFormikContext } from 'formik';
import Select, { components } from 'react-select';
import { Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel } from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import useDebounce from '../../../hooks/useDebounce';
import { useUI } from '../../../context/UIProvider';

const withSelect = (Component) =>
  ({
    name,
    label,
    options = [],
    isMulti = false,
    hideSelectedOptions = false,
    handleChangeCallback = null,
    warning = null,
    children,
    ...props
  }) => {

    const [{ value }, meta, { setValue, setTouched }] = useField(name);

    const handleChange = useCallback(
      (selected) => {
        console.log('select value changed');
  
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
      [setTouched, setValue, isMulti, handleChangeCallback]
    );
  
    // Derive selectedOption from Formik value
    const selectedOption = useMemo(() => {
      if (isMulti) {
        return options.filter((option) => value.includes(option.value));
      } else {
        return options.find((option) => option.value === value) || null;
      }
    }, [value, options, isMulti]);

  return (
    <FormControl
      id={name}
      isInvalid={meta.touched && !!meta.error}
    >
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Flex alignItems="center" gap={4}>
        <Select
          classNamePrefix="react-select"
          name={name}
          options={options}
          isMulti={isMulti}
          onChange={handleChange}
          value={selectedOption} 
          hideSelectedOptions={false}
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

// Extends with Select
const withSearch = (Component, creatable) => ({ name, searchFn, isMulti, handleChangeCallback, ...props }) => {
  const [options, setOptions] = useState([]);
  const [{ value }, meta, { setValue, setTouched }] = useField(name);
  const { handleError } = useUI();
  const isFirstRender = useRef(true);

  useEffect(() => console.log(value), [value]);

  useEffect(() => {
    if (isMulti || !(value && !meta.touched)) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;

      const fetchData = async () => {
        try {
          const response = await searchFn(value);
          const data = response.data;

          setTouched(true);

          let option = null
          
          if (!data || data.length === 0 || data.length > 1) {
            setValue(value);
            if (creatable) {
              option = { value, label: value, __isNew__: true }
              setOptions([option]);
              setValue(value);
            }
          } else {
            setOptions(data);
            option = data[0]
            setValue(option.value.trim());
          }

          if (handleChangeCallback && option) handleChangeCallback(option);

        } catch (error) {
          handleError(error);
        }
      };

      fetchData();
    }
  }, [value, meta, name, searchFn, setValue, setTouched, isMulti, options, handleError, handleChangeCallback]);

  const handleSearch = useCallback(async (value) => {
    try {
      if (value === '') return;
      const response = await searchFn(value);
      setOptions(response.data);
    } catch (error) {
      handleError(error);
    }
  }, [searchFn, setOptions, handleError]);

  const debouncedSearch = useDebounce(handleSearch, 500);

  const handleInputChange = (value) => {
    debouncedSearch(value);
  };

  return (
    <Component
      {...props}
      name={name}
      isMulti={isMulti}
      options={options && options.length > 0 ? options : [{ label: "No results found", value: null, isDisabled: true }]}
      onInputChange={handleInputChange}
    />
  );
};


const withSelectAndSearch = (Component, creatable=false) => {
  return withSearch(withSelect(Component), creatable);
};

const EnhancedSelect = withSelect(Select);
const SearchSelect = withSelectAndSearch(Select, false);

const EnhancedCreatableSelect = withSelect(CreatableSelect);
const SearchCreatableSelect = withSelectAndSearch(CreatableSelect, true);

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