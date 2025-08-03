import { useCallback, useState, useEffect } from 'react';
import { useField } from 'formik';
import useDebounce from '../../../../hooks/useDebounce';
import { useUI } from '../../../../context/UIProvider';

export const withSearch = (Component) => ({
  name,
  options,
  searchFn,
  isMulti = false,
  handleClick,
  ...props
}) => {

  if (!Array.isArray(options)) return <></>;

  const { handleError } = useUI();
  const [ { formikValue }, , { setTouched }] = useField(name);

  const [ oldOptions, setOldOptions ] = useState(options)
  const [ newOptions, setNewOptions ] = useState(oldOptions);

  useEffect(() => {
    if (!newOptions?.length && !oldOptions.length && options.length) {
      setOldOptions(options);
      setNewOptions(options);
    }
  }, [options, formikValue, isMulti, oldOptions?.length, newOptions?.length])

  const handleClickSearch = (option) => {
    setOldOptions(newOptions);
    handleClick(option)
  }

  const onBlur = () => {
    setNewOptions(oldOptions);
    setTouched(true);
  }

  const handleSearch = useCallback(
    async (inputValue) => {
      try {
        console.log(`input value detected: ${inputValue}`);
        const response = await searchFn(inputValue);
        // console.log(response.data);

        setNewOptions(response.data?.slice(0, 50));
      } catch (error) {
        handleError(error);
      }
    },
    [searchFn, handleError, setNewOptions]
  );

  const debouncedSearch = useDebounce(handleSearch, 500);

  const handleInputChange = (inputValue) => {
    debouncedSearch(inputValue);
  };

  return (
    <Component
      options={newOptions}
      name={name}
      isMulti={isMulti}
      onInputChange={handleInputChange}
      handleClick={handleClickSearch}
      onBlur={onBlur}
      {...props}
    />
  );
};