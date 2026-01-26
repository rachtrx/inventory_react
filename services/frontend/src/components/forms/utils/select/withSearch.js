import { useCallback, useState, useEffect } from 'react';
import useDebounce from '../../../../hooks/useDebounce';
import { useUI } from '../../../../context/UIProvider';

export const withSearch = (Component) => ({
  name,
  options: initialOptions,
  searchFn,
  isMulti = false,
  ...props
}) => {

  if (!Array.isArray(initialOptions)) return <></>;

  const { handleError } = useUI();
  const [ options, setOptions ] = useState(initialOptions)

  useEffect(() => {
    if (!options.length && initialOptions.length) {
      setOptions(initialOptions);
    }
  }, [initialOptions, isMulti, options])

  const handleSearch = useCallback(
    async (inputValue) => {
      try {
        console.log(`input value detected: ${inputValue}`);
        const response = await searchFn(inputValue);
        // console.log(response.data);

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
      options={options}
      windowThreshold={50}
      name={name}
      isMulti={isMulti}
      onInputChange={handleInputChange}
      {...props}
    />
  );
};