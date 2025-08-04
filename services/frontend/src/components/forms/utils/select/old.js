

import { useCallback, useState, useEffect } from 'react';
import { useField } from 'formik';
import Select from 'react-select';
import { Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Text, useColorModeValue, useTheme } from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import useDebounce from '../../../hooks/useDebounce';
import { useUI } from '../../../context/UIProvider';
import { useThemeFontSize } from '../../timeline/utils/useThemeFontSize';

const withSelect = (Component, isCreatable) => ({
  name,
  label,
  handleClick = null, // function
  initialOptions = [],
  isMulti = false,
  hideSelectedOptions = false,
  warning = null,
  children,
  components = undefined,
  styles = undefined,
  errorAbove = false,
  size="sm",
  ...props
}) => {
  // console.log(size);
  const [{ value }, meta, { setValue, setTouched }] = useField(name);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState(initialOptions); // TODO maybe create branch to test passing this down as props

  let newStyles = undefined;

  if (!styles) {
    const theme = useTheme();
    const fontSize = useThemeFontSize(size); // fallback if not defined
    const color = useColorModeValue(
      theme.semanticTokens?.colors?.["chakra-body-text"]?._light,
      theme.semanticTokens?.colors?.["chakra-body-text"]?._dark
    );
    const bg = useColorModeValue('white', `var(--chakra-colors-chakra-subtle-bg)`);
    newStyles = {
      input: (provided) => ({
        ...provided,
        fontSize,
        color,
      }),
      singleValue: (provided) => ({
        ...provided,
        fontSize,
        color,
      }),
      multiValue: (provided) => ({
        ...provided,
        fontSize,
        color,
        backgroundColor: "gray"
      }),
      multiValueLabel: (provided) => ({
        ...provided,
        fontSize,
        color,
      }),
      placeholder: (provided) => ({
        ...provided,
        fontSize,
        color: `var(--chakra-colors-chakra-placeholder-color)`,
      }),
      control: (provided) => ({
        ...provided,
        fontSize,
        color,
        backgroundColor: bg,
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: bg,
      }),
      valueContainer: (provided) => ({
        ...provided,
        fontSize,
        color,
      }),
      option: (provided, state) => ({
        ...provided,
        fontSize,
        color,
        backgroundColor: state.isFocused ? "gray" : bg,
        cursor: "pointer",
      }),
    };
  }

  useEffect(() => {
    if (initialOptions?.length) {
      setOptions(initialOptions);
    }
  }, [initialOptions]);
  
  const handleChange = useCallback(
    (selected) => {
      console.log(selected);
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
      if (handleClick) handleClick(selected);

      let newValue;
      if (isMulti) {
        newValue = (selected || []).map((option) => option.value.trim());
      } else {
        newValue = selected?.value.trim() || '';
      }
      
      console.log(newValue);
      setValue(newValue);
    },
    [handleClick, value, setValue, isMulti]
  );

  useEffect(() => {
    if (value == null) {
      throw new Error("One of your form values is likely set to null, which is unusual.");
    }

    if (!Array.isArray(options)) return;

    if (isMulti) {
      if (!Array.isArray(value)) {
        console.warn("Expected array for multi-select but got:", value);
        return;
      }

      // Normalize and find matched options
      const trimmedValues = value.map(v => v?.trim?.()).filter(Boolean);
      const matchedOptions = options.filter(opt => trimmedValues.includes(opt?.value?.trim()));

      // Find any missing values (creatables)
      const missing = trimmedValues.filter(
        val => !options.some(opt => opt.value === val)
      );

      if (isCreatable && missing.length) {
        const newOptions = missing.map(val => ({ value: val, label: val }));
        console.log(newOptions);
        setOptions(prev => [...prev, ...newOptions]);
        setSelectedOption([...matchedOptions, ...newOptions]);
      } else {
        setSelectedOption(matchedOptions);
      }
    } else {
      const val = value?.trim?.();

      const matched = options.find(opt => opt?.value === val);

      if (matched) {
        setSelectedOption(matched);
      } else if (isCreatable && val) {
        const newOption = { value: val, label: val };
        setOptions(prev => [...prev, newOption]);
        setSelectedOption(newOption);
      } else {
        setSelectedOption(null);
      }
    }
  }, [value, options, isMulti]);

  return (
    <FormControl id={name} isInvalid={meta.touched && !!meta.error}>
      {label && <FormLabel htmlFor={name}>
        <Text fontSize={size}>{label}</Text>
      </FormLabel>}
      {errorAbove === true && <FormErrorMessage mt={0} mb={1}>{meta.error}</FormErrorMessage>}
      <Flex alignItems="center">
        <Component
          classNamePrefix="react-select"
          name={name}
          options={options}
          setOptions={setOptions}
          isMulti={isMulti}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          value={selectedOption}
          hideSelectedOptions={hideSelectedOptions}
          isSearchable
          components={components}
          styles={{
            ...newStyles,
            container: (provided) => ({
              ...provided,
              width: '100%',
            }),
          }}
          {...props}
        />
        {children}
      </Flex>
      {errorAbove === false && <FormErrorMessage>{meta.error}</FormErrorMessage>}
      {!meta.error && warning && <FormHelperText color="orange.400">{warning}</FormHelperText>}
    </FormControl>
  );
};

const withSearch = (Component) => ({
  name,
  value,
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
        if (inputValue === '' && value) return;
        console.log(`input value detected: ${inputValue}`);
        const response = await searchFn(inputValue);
        console.log(response.data);
        const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

        // Combine and deduplicate by 'value'
        const combined = [
          ...(isObject(value) ? [value] : []),
          ...(Array.isArray(response.data) ? response.data : [])
        ];

        const uniqueOptions = Array.from(
          new Map(combined.map(opt => [opt.value, opt])).values()
        ).slice(0, 50);

        setOptions(uniqueOptions);
      } catch (error) {
        handleError(error);
      }
    },
    [value, searchFn, handleError, setOptions]
  );

  const debouncedSearch = useDebounce(handleSearch, 500);

  const handleInputChange = (inputValue) => {
    debouncedSearch(inputValue);
  };

  return (
    <Component
      {...props}
      value={value}
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

// Creatable Single Select without Search
export const CreatableMultiSelectFormControl = (props) => {
  return (
    <EnhancedCreatableSelect 
      {...props}
      isMulti={true}
      closeMenuOnSelect={false}
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
