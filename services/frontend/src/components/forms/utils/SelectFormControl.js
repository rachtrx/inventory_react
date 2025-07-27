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
  updateFields = null, // function
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
  console.log(size);
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
    const bg = `var(--chakra-colors-chakra-subtle-bg)`;
    console.log(color);
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
        backgroundColor: state.isFocused ? "blue" : "",
        cursor: "pointer",
      }),
    };
  }

  useEffect(() => {
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
      
      console.log(newValue);
      setValue(newValue);
    },
    [updateFields, value, setValue, isMulti]
  );

  useEffect(() => {
    let option;

    if(value === null) throw new Error("One of your form values is likely set as null which is unusual")

    // Find the selected option based on whether it's a multi-select or single select
    console.log(options);
    console.log(value);
    if (isMulti) {
      option = options.filter((option) => value?.map(val => val.trim()).includes(option?.value));
    } else {
      // if (value == null) return
      option = options.find((option) => option?.value === value.trim()) || null;
    }
    console.log(option);

    // Handle the case where it's a creatable select and the option is not found
    if (!option && isCreatable && value) { // TODO
      console.log(value);
      option = { value: value.trim(), label: value.trim() };
      setOptions((prevOptions) => [...prevOptions, option]); // Add the new creatable option
    }

    setSelectedOption(option); // Set the selected option (whether found or newly created)
    
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
        // if (inputValue === '') return;
        console.log(`input value detected: ${inputValue}`);
        const response = await searchFn(inputValue);
        if (isMulti) setOptions([...value, ...response.data]);
        else setOptions(response.data)
      } catch (error) {
        handleError(error);
      }
    },
    [value, searchFn, handleError, setOptions, isMulti]
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
