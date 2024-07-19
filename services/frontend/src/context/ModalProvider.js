import React, { createContext, useReducer, useEffect, useContext, useState } from 'react';
import { useUI } from './UIProvider';
import assetService from '../services/AssetService';
import userService from '../services/UserService';
import useDebouncedCallback from '../hooks/useDebounce';
import useDebounce from '../hooks/useDebounce';

const ModalContext = createContext();

const initialState = {
  formType: null,
  isExcel: false,
  initialValues: {},
  onSubmit: () => null,
	assets: [],
	users: []
};

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
      return { ...state, isExcel: action.payload };
    default:
      return state;
  }
};

const getInitialValues = (formType) => {
  switch (formType) {
    case 'addAsset':
      return {
        model: '',
        vendor: '',
        'serial-number': '',
        'asset-tag': '',
        value: '',
        remarks: '',
        'bookmark-asset': false,
        'registered-date': new Date(),
        'user-name': '',
        'loaned-date': new Date(),
        'bookmark-user': false,
      };
    case 'loanAsset':
      return {
        'asset-tag': '',
        username: '',
        'loaned-date': new Date(),
        'bookmark-asset': false,
        'bookmark-user': false,
        remarks: '',
      };
    case 'returnAsset':
      return {
        'asset-tag': '',
        'returned-date': new Date(),
        'bookmark-asset': false,
        'bookmark-user': false,
        remarks: '',
      };
    case 'condemnAsset':
      return {
        'asset-tag': '',
        'bookmark-asset': false,
        'bookmark-user': false,
        'condemned-date': new Date(),
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const { setLoading } = useUI();

  useEffect(() => {
    const initialValues = getInitialValues(state.formType);

    const onSubmit = async (values) => {
      setLoading(true);
      try {
        if (runValidationChecks(values)) {
          switch (state.formType) {
            case 'addAsset':
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
    <ModalContext.Provider value={{ ...state, dispatch, handleAssetInputChange, handleUserInputChange }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);