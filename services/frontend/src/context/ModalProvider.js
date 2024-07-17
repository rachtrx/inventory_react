import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useUI } from './UIProvider';
import assetService from '../services/AssetService';
import FormModal from '../components/FormModal';

const ModalContext = createContext(null);

// TODO

const getInitialValues = function(formType) {
	switch(formType) {
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
				'bookmark-user': false
			};
		case 'loanAsset':
			return { 
				'asset-tag': '',
				username: '',
				'loaned-date': new Date(),
				'bookmark-asset': false,
				'bookmark-user': false,
				remarks: '' };
		case 'returnAsset':
			return { 
				'asset-tag': '',
				'returned-date': new Date(),
				'bookmark-asset': false,
				'bookmark-user': false,
				remarks: '' };
		case 'condemnAsset':
			return { 
				'asset-tag': '',
				'bookmark-asset': false,
				'bookmark-user': false,
				'condemned-date': new Date(),
				'remarks': '' 
			};
		default:
			return {}
	}
}

const getOnSubmit = function(formType) {
	return (values) => {
		console.log(values);
		runValidationChecks(values);
		switch(formType) {
			case 'addAsset':
				assetService.addAsset(values);
				break;
			case 'loanAsset':
				assetService.loanAsset(values);
				break;
			case 'returnAsset':
				assetService.returnAsset(values);
				return;
			case 'condemnAsset':
				assetService.condemnAsset(values);
				break;
			default:
				return () => null // TODO error msg?
		}
	}
}

const runValidationChecks = function(values) {
	return values && (!values.hasOwnProperty('assetTag') || values.assetTag !== '')
}

export const ModalProvider = ({children}) => {

	const [formType, setFormType] = useState(null);
	const [isExcel, setIsExcel] = useState(false);

	// Setting up useState for initialValues and onSubmit
	const [initialValues, setInitialValues] = useState({});
	const [onSubmit, setOnSubmit] = useState(() => null);

	const { setLoading } = useUI();

	// Effect to update initialValues and onSubmit based on formType
	useEffect(() => {
		setInitialValues(getInitialValues(formType));
		setOnSubmit(() => async (values) => {
			setLoading(true);
			try {
				getOnSubmit(formType)(values);
				setLoading(false)
			} catch (err) {
				console.error(err)
				setLoading(false)
				throw err
			}
		});
	}, [formType, setLoading]);

	return (
		<ModalContext.Provider value={{ formType, setFormType, initialValues, setInitialValues, onSubmit, setOnSubmit, isExcel, setIsExcel }}>
			{children}
		</ModalContext.Provider>
	);
}

export const useModal = () => useContext(ModalContext);