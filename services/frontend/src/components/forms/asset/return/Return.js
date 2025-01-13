import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../../utils/ResponsiveText"
import React, { useCallback, useEffect, useState } from "react"
import { AddButton, RemoveButton } from "../../utils/ItemButtons"
import { FaUser, FaUsers } from "react-icons/fa"
import { MultiSelectFormControl, SearchSingleSelectFormControl } from "../../utils/SelectFormControl"
import { useFormModal } from "../../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../../utils/DateInputControl"
import { useReturn } from "./ReturnProvider"
import ReturnAccessories from "./ReturnAccessories"
import { useReturns } from "./ReturnsProvider"
import { useUI } from "../../../../context/UIProvider"
import assetService from "../../../../services/AssetService"

export const createNewAccessory = (accLoan) => ({
	key: uuidv4(),
	accessoryTypeId: accLoan.accessoryTypeId || '',
	accessoryName: accLoan.accessoryName || '',
	unreturned: accLoan.unreturned,
	count: accLoan.unreturned,
  });

export const createNewUsers = (users) => ({
	key: uuidv4(),
	userIds: users.map(user => user.userId || user.userId || ''),
	userNames: users.map(user => user.userName),  
})

export const createNewReturn = (loanId = null, asset = null, users = [], accLoans = [], remarks = null) => ({
	key: uuidv4(),
	loanId: loanId || '',
	assetId: asset?.assetId || '',
	serialNumber: asset?.serialNumber || '',
	accessoryTypes: accLoans.map((accLoan) => createNewAccessory(accLoan)),
	users: createNewUsers(users),
	remarks: remarks || '',
  });

export const Return = () => {

	const { fetchAstReturn, assetOptions, userOptions, setUserOptions } = useReturns()
	const { ret, returnIndex, isUserDisabled, setIsUserDisabled, setIsAccDisabled, updateUsers } = useReturn();
	const [ setAccessoryOptions ] = useState([]);
	const { handleAssetSearch } = useFormModal();
	const { setFieldValue } = useFormikContext();
	const { handleError } = useUI();

	const fetchAsset = useCallback(async (userId = null) => {
	try {
		const response = await assetService.fetchAstForUser(userId);
		setAccessoryOptions(response.data);
	} catch (err) {
		handleError(err);
		console.error(err);
	}
	}, [handleError, setAccessoryOptions]); // Dependencies to stabilize fetchAsset

	useEffect(() => {
		if (!isUserDisabled && ret.users && ret.users.length === 1) {
			fetchAsset(ret.users[0]?.userId);
		} 
		// else if (!ret.users || ret.users.length === 0) {
		// 	handleAssetSearch();
		// }
	}, [ret.users, isUserDisabled, fetchAsset, handleAssetSearch]);
	
	const updateDetailsFromAsset = async (returnIndex, selected) => {
		try {
			if (!selected?.value) {
				setFieldValue(`returns.${returnIndex}.assetId`, '');
				setFieldValue(`returns.${returnIndex}.accessoryTypes`, []);
				setFieldValue(`returns.${returnIndex}.users`, []);
				setUserOptions([]);
				return;
			}
	
			const assetId = selected.assetId;
			console.log(assetId);
			const assetsDict = await fetchAstReturn([assetId]);
			console.log(assetsDict);

			setFieldValue(`returns.${returnIndex}.assetId`, selected?.assetId || '');

			const loan = assetsDict[assetId].ongoingLoan;
			console.log(loan);
			updateUsers(loan.users);
			if (loan.accessoryTypes) {
				loan.accessoryTypes.forEach((accessoryType, accessoryTypeIndex) => {
					// Dynamically set the accessory data in the form
					setFieldValue(`returns.${returnIndex}.accessoryTypes.${accessoryTypeIndex}`, createNewAccessory(accessoryType));
				});
			};
			setIsUserDisabled(true)
			setIsAccDisabled(true);
		} catch (err) {
			console.error(err);
			handleError('Loan not found');
		}
	}


	// User Searched
	const updateAssetOptions = async (returnIndex, selected) => {

	}

	// User Searched
	const updateAccessoryOptions = async (returnIndex, selected) => {

	}

	// TODO add validation to not exceed unreturned

	return (
		<Box position='relative'>
			<Flex direction="column">
				<MultiSelectFormControl
					key={ret.users.key}
					name={`returns.${returnIndex}.users.userNames`}
					label={`User(s)`}
					placeholder="User(s)"
					initialOptions={userOptions}
					isDisabled={true}
				/>

				<SearchSingleSelectFormControl
					name={`returns.${returnIndex}.serialNumber`}
					searchFn={value => handleAssetSearch(value)}
					updateFields={(selected) => updateDetailsFromAsset(returnIndex, selected)}
					label={`Serial Number`}
					initialOptions={assetOptions}
					placeholder="Serial Number"
					// isDisabled={}
				/>
				<ReturnAccessories
					// isDisabled={}
				/>
				
			</Flex>
		</Box>
	);
}