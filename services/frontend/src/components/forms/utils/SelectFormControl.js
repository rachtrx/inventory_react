import React, { useRef, useCallback, useState, useEffect } from 'react';
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
    callback = null,
    warning = null,
    children,
    ...props
  }) => {

  // console.log(options);
  const [{value}, meta, { setValue, setTouched }] = useField(name);

  // Sync selectedOption state with Formik's field value
  const [selectedOption, setSelectedOption] = useState(null);

  const handleChange = useCallback(
    (selected) => {
      console.log('select value changed');
      if (callback) {
        callback(selected);
      }
  
      let newValue;
      if (isMulti) {
        newValue = (selected || []).map((v) => v.value.trim());
      } else {
        newValue = selected?.value.trim() || '';
      }
  
      setValue(newValue);
      setTouched(true);
    },
    [setTouched, setValue, isMulti, callback]
  );

  useEffect(() => {
    if (value) {
      if (isMulti) {
        const selected = options.filter((option) => value.includes(option.value));
        setSelectedOption(selected);
      } else {
        const selected = options.find((option) => option.value === value) || null;
        setSelectedOption(selected);
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, isMulti, options]);

  return (
    <FormControl
      id={name}
      isInvalid={meta.touched && !!meta.error}
    >
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Flex alignItems="center" gap={4}>
        <Component
          classNamePrefix="react-select"
          name={name}
          options={options}
          isMulti={isMulti}
          onChange={handleChange}
          value={selectedOption}
          hideSelectedOptions={hideSelectedOptions}
          isSearchable
          {...props}
          styles={{
            container: (provided) => ({
              ...provided,
              width: '100%',  // Ensures the container spans full width
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
const withSearch = (Component, { onNoMatch } = {}) => ({ name, searchFn, isMulti, ...props }) => {
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

          if (!data || data.length === 0) {
            setTouched(true);
            if (onNoMatch) {
              onNoMatch(value, setValue, setOptions);
            } else {
              handleError(`No records were found matching ${value}. Please update the form.`);
            }
          } else if (data && data.length > 1) {
            throw new Error(`Multiple records were found matching ${value}. Please update the form.`);
          } else {
            setOptions(data);
            const newValue = data[0].value.trim();
            setValue(newValue);
          }
        } catch (error) {
          handleError(`Error fetching data: ${error}`);
        }
      };

      fetchData();
    }
  }, [value, meta, name, searchFn, setValue, setTouched, isMulti, options, handleError]);

  const handleSearch = useCallback(async (value) => {
    try {
      if (value === '') return;
      const response = await searchFn(value);
      setOptions(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setOptions([{ label: "Error fetching data", value: '', isDisabled: true }]);
    }
  }, [searchFn, setOptions]);

  const debouncedSearch = useDebounce(handleSearch, 500);

  const handleInputChange = (value) => {
    debouncedSearch(value);
  };

  return (
    <Component
      {...props}
      name={name}
      isMulti={isMulti}
      options={options && options.length > 0 ? options : [{ label: "No results found", value: '', isDisabled: true }]}
      onInputChange={handleInputChange}
    />
  );
};

const handleNoMatchCreatable = (value, setValue, setOptions) => {
  setOptions([{ value, label: value, __isNew__: true }]);
  setValue(value);
};

const handleNoMatchDefault = (value, setValue, setOptions) => {
  setValue('');
  setOptions([]);
  throw new Error(`No records were found matching ${value}. Please update the form.`);
};


const withSelectAndSearch = (Component, onNoMatchHandler) => {
  return withSearch(withSelect(Component), { onNoMatch: onNoMatchHandler });
};

const EnhancedSelect = withSelect(Select);
const SearchSelect = withSelectAndSearch(Select, handleNoMatchDefault);

const EnhancedCreatableSelect = withSelect(CreatableSelect);
const SearchCreatableSelect = withSelectAndSearch(CreatableSelect, handleNoMatchCreatable);

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