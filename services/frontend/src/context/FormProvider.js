import React, { createContext, useEffect, useContext, useState, useCallback, useRef } from 'react';
import { useDisclosure } from '@chakra-ui/react';

const FormContext = createContext();

export const FormType = {
  ADD_ASSET: 'ADD_ASSET',
  DEL_ASSET: 'DEL_ASSET',
  LOAN: 'LOAN',
  RETURN: 'RETURN',
  RELOAN: 'RELOAN',
  ADD_USER: 'ADD_USER',
  DEL_USER: 'DEL_USER',
  RESTORE_ASSET: 'RESTORE_ASSET',
  RESTORE_USER: 'RESTORE_USER',
  UPDATE_ACC: 'UPDATE_ACC',
  LOAN_ACC: 'LOAN_ACC',
  RETURN_ACC: 'RETURN_ACC',
  TAG_ASSET: 'TAG_ASSET',
  UNTAG_ASSET: 'UNTAG_ASSET',
  TAG_USER: 'TAG_USER',
  UNTAG_USER: 'UNTAG_USER',
  RESERVE: 'RESERVE',
}

export const FormProvider = ({ children }) => {

  // to refresh items
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  const [ formType, setFormType ] = useState(null);
  const [ initialValues, setInitialValues ] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    if (!formType) setInitialValues(null);
  }, [formType]);

  console.log("Modal rendered");

  const createTouchedStructure = useCallback((values) => {
    if (Array.isArray(values)) {
      return values.map((item) => createTouchedStructure(item));
    } else if (typeof values === 'object' && values !== null && values !== '') {
      return Object.keys(values).reduce((acc, key) => {
        acc[key] = createTouchedStructure(values[key]);
        return acc;
      }, {});
    } else {
      return values !== '';
    }
  }, []);

  const reinitializeForm = (newValues) => {

    console.log("reinitializing");
    
    if (formRef.current) {
      console.log(newValues);
      formRef.current.setValues(newValues)

      const touchedFields = createTouchedStructure(formRef.current.values);
      console.log(touchedFields);
      formRef.current.setTouched(touchedFields, true);
      formRef.current.validateForm();
    } else console.log("No form found");
  };

  return (
    <FormContext.Provider value={{
      formRef,
      formType,
      setFormType, 
      initialValues, 
      setInitialValues,  
      reinitializeForm,
      refreshKey,
      triggerRefresh
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);