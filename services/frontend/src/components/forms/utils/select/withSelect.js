import { useCallback, useState, useEffect, useMemo } from 'react';
import { useField } from 'formik';
import { Flex, FormControl, FormErrorMessage, FormLabel, Text, useColorModeValue, useTheme } from '@chakra-ui/react';
import { useThemeFontSize } from '../../../utils/useThemeFontSize';
import { useForm } from '../../../../context/FormProvider';
import { useUI } from '../../../../context/UIProvider';

export const withSelect = (Component) => ({
  name,
  options,
  handleClick=undefined,
  isMulti,
  size,
  label,
  errorAbove = false,
  children,
  ...props
}) => {

  if (!Array.isArray(options)) return <></>;

  // console.log(size);
  const [{ value }, meta, { setValue, setTouched }] = useField(name);
  const [selectedOption, setSelectedOption] = useState(undefined);
  const { handleError } = useUI();

  const { formRef } = useForm();

  useEffect(() => {console.log(value)}, [value])

  const fontSize = useThemeFontSize(size);

  const styles = useMemo(() => ({
    input: (provided) => ({ ...provided, fontSize }),
    singleValue: (provided) => ({ ...provided, fontSize }),
    multiValue: (provided) => ({ ...provided, fontSize }),
    multiValueLabel: (provided) => ({ ...provided, fontSize }),
    placeholder: (provided) => ({ ...provided, fontSize }),
    control: (provided) => ({ ...provided, fontSize }),
    menu: (provided) => ({ ...provided }),
    valueContainer: (provided) => ({ ...provided, fontSize }),
    option: (provided) => ({ ...provided, fontSize }),
    container: (provided) => ({ ...provided, width: '100%' }),
  }), [fontSize]);

  const isSelected = (isMulti && selectedOption?.length) || (!isMulti && selectedOption) 

  const handleOptionClick = (selected) => {
    console.log(selected);
    console.log("Setting formik value");

    if (isMulti) {
      console.log(selected);
      const selectedValues = (selected || {}).map((option) => option.value.trim());
      const currentValues = value.map((val) => val.trim());
    if (JSON.stringify(selectedValues) === JSON.stringify(currentValues)) return;
    } else {
      // console.log(selected);
      // console.log(value);
      if (selected?.value.trim() === value.trim()) return;
    }

    const newValue = isMulti
      ? (selected || []).map((option) => option.value.trim())
      : selected?.value.trim() || '';

    setValue(newValue);
  }

  useEffect(() => {
    // console.log("updating selected option");
    if (value == null) {
      handleError('Form value is null');
      return; 
    }

    if (formRef?.current) {
      console.log("Validating form in select");
      formRef.current.validateForm();
    }

    if (isMulti) {
      const trimmedValues = value.map(v => v?.trim?.()).filter(Boolean);
      const matched = options.filter(opt => trimmedValues.includes(opt?.value?.trim()));
      console.log(matched);
      setSelectedOption(matched);
    } else {
      const val = value?.trim?.();
      const matched = options.find(opt => opt?.value === val);
      console.log(val);
      console.log(options);
      setSelectedOption(matched);
    }
  }, [value, options, isMulti, handleError, formRef]);

  // IMPT if handleClick is an arrow function and in deps it will fail
  useEffect(() => {
    // console.log("checking selected");
    console.log(selectedOption);
    console.log(handleClick);
    if (!handleClick || selectedOption === undefined) return;
    handleClick(selectedOption);
    if (formRef?.current) formRef.current.validateForm();
  }, [selectedOption, formRef])

  useEffect(() => {console.log(value)}, [value])

  return (
    <FormControl id={name} isInvalid={meta.touched && !!meta.error}>
      {label && <FormLabel htmlFor={name}>
        <Text fontSize={size}>{label}</Text>
      </FormLabel>}
      {errorAbove === true && <FormErrorMessage mt={0} mb={1}>{meta.error}</FormErrorMessage>}
      <Flex alignItems="center">
        <Component
          // menuIsOpen={true} // for debug
          classNamePrefix="react-select"
          name={name}
          options={options}
          isMulti={isMulti}
          onChange={handleOptionClick}
          onBlur={() => setTouched(true)}
          value={selectedOption}
          hideSelectedOptions={false}
          isSearchable
          isSelected={isSelected}
          styles={{
            ...styles,
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
    </FormControl>
  );
};

