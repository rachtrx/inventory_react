import React, { createContext, useReducer, useEffect, useContext, useState, useCallback, useRef } from 'react';
import { useUI } from './UIProvider';
import assetService from '../services/AssetService';
import userService from '../services/UserService';
import useDebouncedCallback from '../hooks/useDebounce';
import useDebounce from '../hooks/useDebounce';
import { useDisclosure } from '@chakra-ui/react';
import accessoryService from '../services/AccessoryService';

const ModalContext = createContext();

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

export const actionTypes = {
  SET_FORM_TYPE: 'SET_FORM_TYPE',
  SET_ON_SUBMIT: 'SET_ON_SUBMIT',
  RESET_STATE: 'RESET_STATE',
};

export const ModalProvider = ({ children }) => {

  // to refresh items
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [ formType, setFormType ] = useState(null);
  const [ initialValues, setInitialValues ] = useState(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!formType) setInitialValues(null);
    isFirstRender.current = true;
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

  const reinitializeForm = (formRef, newValues) => {
    
    if (formRef.current) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      formRef.current.setValues(newValues);

      const touchedFields = createTouchedStructure(newValues);
      console.log(touchedFields);
      formRef.current.setTouched(touchedFields, true);
      formRef.current.validateForm();
    }
  };

  return (
    <ModalContext.Provider value={{ 
      formType, 
      setFormType, 
      initialValues, 
      setInitialValues, 
      isModalOpen, 
      onModalOpen, 
      onModalClose, 
      reinitializeForm,
      refreshKey,
      triggerRefresh
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useFormModal = () => useContext(ModalContext);