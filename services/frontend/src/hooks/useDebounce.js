import { useMemo } from 'react';
import { debounce } from 'lodash';

const useDebounce = (callback, delay) => {
    return useMemo(() => debounce(callback, delay), [callback, delay]);
  };
  
  export default useDebounce;