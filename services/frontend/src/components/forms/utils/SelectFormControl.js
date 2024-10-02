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
  warning = null,
  children,
  ...props
}) => {
  const [{ value }, meta, { setValue, setTouched }] = useField(name);
  const [options, setOptions] = useState(initialOptions);
  const { setFieldValue } = useFormikContext();

  useEffect(() => console.log(options), [options])
  
  const handleChange = useCallback(
    (selected) => {
      console.log(selected);
      if (secondaryFieldsMeta && Array.isArray(secondaryFieldsMeta)) {
        secondaryFieldsMeta.forEach(({ name, attr }) => {
          setFieldValue(name, selected?.[attr] ? selected[attr] : '');
        });
      }

      let newValue;
      if (isMulti) {
        newValue = (selected || []).map((option) => option.value.trim());
      } else {
        newValue = selected?.value.trim() || '';
      }

      const newOptions = isMulti ? selected : [selected];
      newOptions.forEach((option) => {
        if (option && !options.some((o) => o.value === option.value)) {
          setOptions((prevOptions) => [...prevOptions, { value: option.value, label: option.label }]);
        }
      });
      
      setValue(newValue);
      setTouched(true);
    },
    [secondaryFieldsMeta, setFieldValue, setTouched, setValue, options, isMulti]
  );

  const selectedOption = useMemo(() => {
    if (isMulti) {
      return options.filter((option) => value.includes(option?.value));
    } else {
      return options.find((option) => option?.value === value) || null;
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

const withSearch = (Component, creatable) => ({
  name,
  options,
  setOptions,
  searchFn,
  isMulti = false,
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

        console.log(data);

        let option = null;

        setTouched(true);

        if (data.length >= 1) {
          option = data.find(item => item.label === value);
          if (option && option.description) {
            option = {...option, label: `${option.label} - ${option.description}`}
          }
        } else if (creatable) {
          option = { value: value.trim(), label: value.trim() }
        }

        if (!option) {
          setOptions([]);
          setValue('');
          throw new Error(`${value} not found!`)
        } else {
          setOptions([option]);
          setValue(option.value);
        }
        
      } catch (error) {
        handleError(error);
      }
    };

    fetchData();
  }, [value]);  // Only run on `value` change

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
const EnhancedCreatableSelect = withSelect(CreatableSelect);
const SearchSelect = withSelect(withSearch(Select, false));
const SearchCreatableSelect = withSelect(withSearch(CreatableSelect, true));

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