import React, { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { useUI } from './UIProvider';
import assetService from '../services/AssetService';
import userService from '../services/UserService';
import useDebouncedCallback from '../hooks/useDebounce';
import useDebounce from '../hooks/useDebounce';
import { useDisclosure } from '@chakra-ui/react';

const ModalContext = createContext();

const initialState = {
  formType: null,
  isExcel: false,
  initialValues: {},
  onSubmit: () => null,
	assets: [],
	users: []
};

export const formTypes = {
  ADD_ASSET: 'ADD_ASSET',
  DEL_ASSET: 'DEL_ASSET',
  LOAN: 'LOAN',
  RETURN: 'RETURN',
  ADD_USER: 'ADD_USER',
  DEL_USER: 'DEL_USER',
  RESTORE_ASSET: 'RESTORE_ASSET',
  RESTORE_USER: 'RESTORE_USER'
}

export const actionTypes = {
  SET_FORM_TYPE: 'SET_FORM_TYPE',
  SET_INITIAL_VALUES: 'SET_INITIAL_VALUES',
  SET_ON_SUBMIT: 'SET_ON_SUBMIT',
  SET_IS_EXCEL: 'SET_IS_EXCEL',
  SET_ASSETS: 'SET_ASSETS',
  SET_USERS: 'SET_USERS'
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_FORM_TYPE:
      return { ...state, formType: action.payload };
    case actionTypes.SET_INITIAL_VALUES:
      return { ...state, initialValues: action.payload };
    case actionTypes.SET_ON_SUBMIT:
      return { ...state, onSubmit: action.payload };
    case actionTypes.SET_IS_EXCEL:
      return { ...state, isExcel: action.payload };
		case actionTypes.SET_ASSETS:
			return { ...state, assets: action.payload };
		case actionTypes.SET_USERS:
      return { ...state, users: action.payload };
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
    case formTypes.LOAN:
      return {
        'asset-id': '',
        'user-id': '',
        'loaned-date': new Date(),
        'bookmark-asset': false,
        'bookmark-user': false,
        remarks: '',
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

const runValidationChecks = (values) => {
  return values && (!values.hasOwnProperty('assetTag') || values.assetTag !== '');
};

export const ModalProvider = ({ children }) => {

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { setLoading } = useUI();

  useEffect(() => {
    const initialValues = getInitialValues(state.formType);

    const onSubmit = async (values) => {
      setLoading(true);
      try {
        if (runValidationChecks(values)) {
          switch (state.formType) {
            case 'AddAsset':
              await assetService.addAsset(values);
              break;
            case 'loanAsset':
              await assetService.loanAsset(values);
              break;
            case 'returnAsset':
              await assetService.returnAsset(values);
              break;
            case 'condemnAsset':
              await assetService.condemnAsset(values);
              break;
            case 'AddUser':
              await userService.addUser(values);
              break;
            case 'removeUser':
              await userService.removeUser(values);
              break;
            default:
              break; // TODO NEED ERROR?
          }
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        throw err;
      }
    };

    dispatch({ type: actionTypes.SET_INITIAL_VALUES, payload: initialValues });
    dispatch({ type: actionTypes.SET_ON_SUBMIT, payload: onSubmit });
  }, [state.formType, setLoading]);

  const handleAssetSearch = async (value) => {
    const response = await assetService.searchAssets(value, state.formType);
    console.log(response.data);
    dispatch({ type: actionTypes.SET_ASSETS, payload: response.data });
  };

  const handleUserSearch = async (value) => {
    const response = await userService.searchUsers(value, state.formType);
    console.log(response.data);
    dispatch({ type: actionTypes.SET_USERS, payload: response.data });
  };

  const debouncedAssetSearch = useDebounce(handleAssetSearch, 500);
  const debouncedUserSearch = useDebounce(handleUserSearch, 500);

  const handleAssetInputChange = (value) => {
    debouncedAssetSearch(value);
  };

  const handleUserInputChange = (value) => {
    debouncedUserSearch(value);
  };

  return (
    <ModalContext.Provider value={{ ...state, dispatch, handleAssetInputChange, handleUserInputChange, isModalOpen, onModalOpen, onModalClose }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useFormModal = () => useContext(ModalContext);