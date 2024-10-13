import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { useLoan } from "../../../context/LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { MultiSelectFormControl, SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../utils/DateInputControl"
import { useReturn } from "../../../context/ReturnProvider"
import ReturnPeripherals from "./ReturnPeripherals"
import { useReturns } from "../../../context/ReturnsProvider"
import { useUI } from "../../../context/UIProvider"

export const createNewPeripheral = (peripheralType) => ({
	key: uuidv4(),
	id: peripheralType.peripheralTypeId || peripheralType.id || '',
	peripheralName: peripheralType.peripheralName || '',
	ids: peripheralType.peripherals.map(peripheral => peripheral.peripheralId) || [],
	count: peripheralType.peripherals.length,
  });

const createNewUsers = (users) => ({
	key: uuidv4(),
	userIds: users.map(user => user.userId || user.id || ''),
	userNames: users.map(user => user.userName),  
})

export const createNewReturn = (asset = null, users = [], peripherals = []) => ({
	key: uuidv4(),
	assetId: asset?.assetId || '',
	assetTag: asset?.assetTag || '',
	peripherals: peripherals.map((peripheral) => createNewPeripheral(peripheral)),
	users: createNewUsers(users),
	remarks: '',
  });

export const Return = () => {

	const { fetchReturn } = useReturns()
	const { ret, returnIndex } = useReturn();
	const { handleAssetSearch } = useFormModal();
	const { setFieldValue } = useFormikContext();
	const [ userOptions, setUserOptions ] = useState([]);
	const { handleError } = useUI();

	const updateUsers = (users) => {
		const newUserOptions = users.map(user => {
			return {
				value: user.userId || user.id,
				label: user.userName
			}
		})

		console.log(newUserOptions);

		setUserOptions(newUserOptions)
		setFieldValue(
			`returns.${returnIndex}.users`,
			{
			  userNames: users.map(user => user.userName),
			  userIds: users.map(user => user.userId || user.id),
			}
		)
	}

	const updatePeripherals = (peripherals) => {

		peripherals.forEach((peripheral, peripheralIndex) => {
			// Dynamically set the peripheral data in the form
			setFieldValue(`returns.${returnIndex}.peripherals.${peripheralIndex}`, createNewPeripheral(peripheral));
		});
	}

	const updateAssetFields = async (returnIndex, selected) => {
		try {
			if (!selected?.value) {
				setFieldValue(`returns.${returnIndex}.peripherals`, [])
				setFieldValue(`returns.${returnIndex}.assetTag`, '')
				setFieldValue(`returns.${returnIndex}.users`, [])
				setUserOptions([]);
				return;
			}
	
			const assetId = selected.value;
			const response = await fetchReturn([assetId]);
			const assetsDict = await response.data;
			console.log(assetsDict);

			setFieldValue(`returns.${returnIndex}.assetTag`, selected?.assetTag || '')

			const loan = assetsDict[assetId].ongoingLoan;
			console.log(loan);
			updateUsers(loan.users)
			if (loan.peripherals) updatePeripherals(loan.peripherals);
		} catch (err) {
			console.error(err)
			handleError('Loan not found')
		}
	}

	return (
		<Box position='relative'>
			<Flex direction="column" key={ret.key}>
				<SearchSingleSelectFormControl
					name={`returns.${returnIndex}.assetId`}
					searchFn={value => handleAssetSearch(value)}
					updateFields={(selected) => updateAssetFields(returnIndex, selected)}
					label={`Asset Tag`}
					placeholder="Asset Tag"
				/>
				<MultiSelectFormControl
					key={userOptions.length}
					name={`returns.${returnIndex}.users.userIds`}
					label={`User(s)`}
					placeholder="User(s)"
					initialOptions={userOptions}
					isDisabled={true}
				/>
				<ReturnPeripherals/>
			</Flex>
		</Box>
	);
}