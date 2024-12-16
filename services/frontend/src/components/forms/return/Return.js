import { Box, Button, Separator, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { FaUser, FaUsers } from "react-icons/fa"
import { MultiSelectFormControl, SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../utils/DateInputControl"
import { useReturn } from "./ReturnProvider"
import ReturnAccessories from "./ReturnAccessories"
import { useReturns } from "./ReturnsProvider"
import { useUI } from "../../../context/UIProvider"

export const createNewAccessory = (accLoan) => ({
	key: uuidv4(),
	accessoryTypeId: accLoan.accessoryTypeId || '',
	accessoryName: accLoan.accessoryName || '',
	unreturned: accLoan.unreturned,
	count: accLoan.unreturned,
  });

const createNewUsers = (users) => ({
	key: uuidv4(),
	userIds: users.map(user => user.userId || user.userId || ''),
	userNames: users.map(user => user.userName),  
})

export const createNewReturn = (asset = null, users = [], accLoans = [], remarks = null) => ({
	key: uuidv4(),
	assetId: asset?.assetId || '',
	assetTag: asset?.assetTag || '',
	accessoryTypes: accLoans.map((accLoan) => createNewAccessory(accLoan)),
	users: createNewUsers(users),
	remarks: remarks || '',
  });

export const Return = () => {

	const { fetchReturn, assetOptions, userOptions, setUserOptions } = useReturns()
	const { ret, returnIndex } = useReturn();
	const { handleAssetSearch } = useFormModal();
	const { setFieldValue } = useFormikContext();
	const { handleError } = useUI();

	const updateUsers = (users) => {
		const newUserOptions = users.map(user => {
			return {
				value: user.userName,
				label: user.userName
			}
		})

		console.log(newUserOptions);

		setUserOptions(newUserOptions)
		setFieldValue(
			`returns.${returnIndex}.users`,
			{
				userNames: users.map(user => user.userName),
				userIds: users.map(user => user.userId || user.userId),
			}
		)
	}

	const updateAccessories = (accessoryTypes) => {

		accessoryTypes.forEach((accessoryType, accessoryTypeIndex) => {
			// Dynamically set the accessory data in the form
			setFieldValue(`returns.${returnIndex}.accessoryTypes.${accessoryTypeIndex}`, createNewAccessory(accessoryType));
		});
	}

	const updateAssetFields = async (returnIndex, selected) => {
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
			const assetsDict = await fetchReturn([assetId]);
			console.log(assetsDict);

			setFieldValue(`returns.${returnIndex}.assetId`, selected?.assetId || '');

			const loan = assetsDict[assetId].ongoingLoan;
			console.log(loan);
			updateUsers(loan.users);
			if (loan.accessoryTypes) updateAccessories(loan.accessoryTypes);
		} catch (err) {
			console.error(err);
			handleError('Loan not found');
		}
	}

	// TODO add validation to not exceed unreturned

	return (
		<Box position='relative'>
			<Flex direction="column" key={ret.key}>
				<SearchSingleSelectFormControl
					name={`returns.${returnIndex}.assetTag`}
					searchFn={value => handleAssetSearch(value)}
					updateFields={(selected) => updateAssetFields(returnIndex, selected)}
					label={`Asset Tag`}
					initialOptions={assetOptions}
					placeholder="Asset Tag"
				/>
				<MultiSelectFormControl
					key={ret.users.key}
					name={`returns.${returnIndex}.users.userNames`}
					label={`User(s)`}
					placeholder="User(s)"
					initialOptions={userOptions}
					isDisabled={true}
				/>
				<ReturnAccessories/>
			</Flex>
		</Box>
	);
}