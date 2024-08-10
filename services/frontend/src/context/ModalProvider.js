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
	assetOptions: [],
	userOptions: [],
  peripheralOptions: [],
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
  SET_ASSET_OPTIONS: 'SET_ASSET_OPTIONS',
  SET_USER_OPTIONS: 'SET_USER_OPTIONS',
  SET_PERIPHERAL_OPTIONS: 'SET_PERIPHERAL_OPTIONS',
  RESET_STATE: 'RESET_STATE',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_FORM_TYPE:
      return { ...state, formType: action.payload };
		case actionTypes.SET_ASSET_OPTIONS:
			return { ...state, assetOptions: action.payload };
		case actionTypes.SET_USER_OPTIONS:
      return { ...state, userOptions: action.payload };
    case actionTypes.SET_PERIPHERAL_OPTIONS:
      return { ...state, peripheralOptions: action.payload };
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

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose } = useDisclosure();
  const [ state, dispatch ] = useReducer(reducer, initialState);
  const [ isExcel, setIsExcel ] = useState(false) 
  const { setLoading } = useUI();

  console.log("Modal rendered");

  const onModalClose = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
    onClose(); 
  }, [dispatch, onClose]);

  // useEffect(() => {

  //   const onSubmit = async (values) => {
  //     setLoading(true);
  //     try {
  //       switch (state.formType) {
  //         case 'AddAsset':
  //           await assetService.addAsset(values);
  //           break;
  //         case 'loanAsset':
  //           await assetService.loanAsset(values);
  //           break;
  //         case 'returnAsset':
  //           await assetService.returnAsset(values);
  //           break;
  //         case 'condemnAsset':
  //           await assetService.condemnAsset(values);
  //           break;
  //         case 'AddUser':
  //           await userService.addUser(values);
  //           break;
  //         case 'removeUser':
  //           await userService.removeUser(values);
  //           break;
  //         default:
  //           break; // TODO NEED ERROR?
  //       }
  //       setLoading(false);
  //     } catch (err) {
  //       console.error(err);
  //       setLoading(false);
  //       throw err;
  //     }
  //   };

  //   dispatch({ type: actionTypes.SET_ON_SUBMIT, payload: onSubmit });
  // }, [state.formType, setLoading]);

  const handleAssetSearch = async (value) => {
    console.log(`Asset Search Called: ${value}`);
    const response = await assetService.searchAssets(value, state.formType);
    console.log(response.data);
    dispatch({ type: actionTypes.SET_ASSET_OPTIONS, payload: response.data });
  };

  const handleUserSearch = async (value) => {
    console.log(`User Search Called: ${value}`);
    const response = await userService.searchUsers(value, state.formType);
    console.log(response.data);
    dispatch({ type: actionTypes.SET_USER_OPTIONS, payload: response.data });
  };

  const handlePeripheralSearch = async (value) => {
    console.log(`Peripheral Search Called: ${value}`);
    const response = await peripheralService.searchPeripherals(value);
    console.log(response.data);
    dispatch({ type: actionTypes.SET_PERIPHERAL_OPTIONS, payload: response.data });
  };

  const debouncedAssetSearch = useDebounce(handleAssetSearch, 500);
  const debouncedUserSearch = useDebounce(handleUserSearch, 500);
  const debouncedPeripheralSearch = useDebounce(handlePeripheralSearch, 500)

  const handleAssetInputChange = (value) => {
    debouncedAssetSearch(value);
  };

  const handleUserInputChange = (value) => {
    debouncedUserSearch(value);
  };

  const handlePeripheralInputChange = (value) => {
    debouncedPeripheralSearch(value);
  };

  return (
    <ModalContext.Provider value={{ ...state, dispatch, isExcel, setIsExcel, handleAssetInputChange, handleUserInputChange, handlePeripheralInputChange, isModalOpen, onModalOpen, onModalClose }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useFormModal = () => useContext(ModalContext);