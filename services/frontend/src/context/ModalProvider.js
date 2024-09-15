import React, { createContext, useReducer, useEffect, useContext, useState, useCallback } from 'react';
import { useUI } from './UIProvider';
import assetService from '../services/AssetService';
import userService from '../services/UserService';
import useDebouncedCallback from '../hooks/useDebounce';
import useDebounce from '../hooks/useDebounce';
import { useDisclosure } from '@chakra-ui/react';
import peripheralService from '../services/PeripheralService';

const ModalContext = createContext();

export const updateOptions = (setOptionsState, fieldName, key, newValues) => {
  setOptionsState(prevOptions => {
    // Get the current items for the specified fieldName and key
    const existingItems = prevOptions[fieldName]?.[key] || [];

    console.log(newValues);

    // Create a set from the existing items to avoid duplicates easily
    const updatedItemsSet = new Set(existingItems);

    // Add new values to the set (automatically handles duplicates)
    newValues.forEach(value => {
      updatedItemsSet.add(value);
    });

    // Return the updated options state only if new items were added
    if (updatedItemsSet.size !== existingItems.length) {
      return {
        ...prevOptions,
        [fieldName]: {
          ...prevOptions[fieldName],
          [key]: Array.from(updatedItemsSet)
        }
      };
    }

    // Return previous state if no new items were added
    return prevOptions;
  });
};

const initialState = {
  formType: null,
};

export const formTypes = {
  ADD_ASSET: 'ADD_ASSET',
  DEL_ASSET: 'DEL_ASSET',
  LOAN: 'LOAN',
  RETURN: 'RETURN',
  ADD_USER: 'ADD_USER',
  DEL_USER: 'DEL_USER',
  RESTORE_ASSET: 'RESTORE_ASSET',
  RESTORE_USER: 'RESTORE_USER',
  ADD_PERIPHERAL: 'ADD_PERIPHERAL',
  RESERVE: 'RESERVE',
}

export const actionTypes = {
  SET_FORM_TYPE: 'SET_FORM_TYPE',
  SET_ON_SUBMIT: 'SET_ON_SUBMIT',
  RESET_STATE: 'RESET_STATE',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_FORM_TYPE:
      return { ...state, formType: action.payload };
    case actionTypes.RESET_STATE:
      return initialState;
    default:
      return state;
  }
};

const getInitialValues = (formType) => {
  switch (formType) {
    case formTypes.ADD_ASSET:
      return {
        model: '',
        vendor: '',
        'serial-number': '',
        'asset-tag': '',
        value: '',
        remarks: '',
        'registered-date': new Date(),
        'bookmark-asset': false,
        'user-name': '',
        'loaned-date': new Date(),
        'bookmark-user': false,
      };
    case formTypes.RETURN:
      return {
        'asset-id': '',
        'returned-date': new Date(),
        'bookmark-asset': false,
        'bookmark-user': false,
        remarks: '',
      };
    case formTypes.DEL_ASSET:
      return {
        'asset-id': '',
        'user-id': '',
        'condemned-date': new Date(),
        'bookmark-asset': false,
        'bookmark-user': false,
        remarks: '',
      };
    case formTypes.ADD_USER:
      return {
        'dept': '',
        'new-dept': '',
        'user-name': '',
        'added-date': new Date(),
        'bookmark-user': false,
        remarks: '',
      };
    case formTypes.DEL_USER:
      return {
        'user-id': '',
        'removed-date': new Date(),
        'bookmark-user': false,
        remarks: '',
      };
    default:
      return {};
  }
};

export const ModalProvider = ({ children }) => {

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [ formType, setFormType ] = useState(null);
  const { setLoading } = useUI();

  console.log("Modal rendered");

  const handleAssetSearch = useCallback(async (value) => {
    console.log(`Asset Search Called: ${value}`);
    return await assetService.searchAssets(value.trim(), formType);
  }, [formType]);
  
  const handleUserSearch = useCallback(async (value) => {
    console.log(`User Search Called: ${value}`);
    return await userService.searchUsers(value.trim(), formType);
  }, [formType]);
  
  const handlePeripheralSearch = useCallback(async (value) => {
    console.log(`Peripheral Search Called: ${value}`);
    return await peripheralService.searchPeripherals(value.trim());
  }, []);

  return (
    <ModalContext.Provider value={{ formType, setFormType, handleAssetSearch, handleUserSearch, handlePeripheralSearch, isModalOpen, onModalOpen, onModalClose }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useFormModal = () => useContext(ModalContext);