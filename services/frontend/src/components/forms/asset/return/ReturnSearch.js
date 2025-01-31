import { Flex, FormControl, FormLabel } from "@chakra-ui/react"
import React, { useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { useReturn } from "./ReturnProvider"
import { useReturns } from "./ReturnsProvider"
import { useUI } from "../../../../context/UIProvider"
import assetService from "../../../../services/AssetService"
import { ReturnAccSelectFormControl, ReturnAstSelectFormControl, ReturnUsrSelectFormControl } from "./CustomSelect"
import userService from "../../../../services/UserService"
import accessoryService from "../../../../services/AccessoryService"
import { Select } from "@chakra-ui/react";
import { useFormikContext } from "formik";

export const createNewAccessory = (accLoan) => ({
	key: uuidv4(),
	accessoryTypeId: accLoan.accType.accessoryTypeId || '',
	accessoryName: accLoan.accType.accessoryName || '',
	unreturned: accLoan.unreturned,
	count: accLoan.unreturned,
  });

export const createNewUsers = (users) => ({
	key: uuidv4(),
	userIds: users.map(user => user.userId || user.userId || ''),
	userNames: users.map(user => user.userName),  
})

const createNewAsset = (asset) => ({
	assetId: asset?.assetId || '',
	serialNumber: asset?.serialNumber || '',
	unreturned: asset?.returnEventId ? 0 : 1,
	count: asset?.returnEventId ? 0 : 1,
})

export const createNewReturn = (loanId = null, asset = null, users = [], accLoans = [], remarks = null, search = "") => ({
	key: uuidv4(),
	loanId: loanId || null,
	asset: createNewAsset(asset) ,
	accessoryTypes: accLoans?.map((accLoan) => createNewAccessory(accLoan)) || [],
	users: createNewUsers(users),
	remarks: remarks || '',
	search: search
  });

export const ReturnSearch = () => {

	const { ret, returnIndex, currentLoan, setCurrentLoan } = useReturn();
	const { returnOptions } = useReturns();
	const { setFieldValue } = useFormikContext();
	const { handleError } = useUI();
	const [selectedType, setSelectedType] = useState("asset");

	const handleTypeChange = (event) => {
		setSelectedType(event.target.value);
	  };

	const renderDropdown = () => {
		switch (selectedType) {
			case "asset":
				return (
					<ReturnAstSelectFormControl
						name={`returns.${returnIndex}.search`}
						options={returnOptions}
						onChange={(selected) => updateDetailsFromLoan(returnIndex, selected)}
						searchFn={(value) => assetService.fetchAstReturn(value)}
						placeholder="Serial Number"
						isDisabled={currentLoan}
					/>
				);
			case "user":
				return (
					<ReturnUsrSelectFormControl
						name={`returns.${returnIndex}.search`}
						options={returnOptions}
						onChange={(selected) => updateDetailsFromLoan(returnIndex, selected)}
						searchFn={(value) => userService.fetchUserReturn(value)}
						placeholder="User(s)"
						isDisabled={currentLoan}
					/>
				);
			case "accessory":
				return (
					<ReturnAccSelectFormControl
						name={`returns.${returnIndex}.search`}
						options={returnOptions}
						onChange={(selected) => updateDetailsFromLoan(returnIndex, selected)}
						searchFn={(value) => accessoryService.fetchAccReturn(value)}
						placeholder="Accessory"
						isDisabled={currentLoan}
					/>
				);
			default:
			return null;
		}
	};

	useState(() => {
		// console.log(ret.loanId);
		console.log(returnOptions);
	}, [returnOptions])
	
	const updateDetailsFromLoan = async (returnIndex, selected) => {
		try {
			if (!selected?.value) {
				setFieldValue(`returns.${returnIndex}`, createNewReturn());
				return;
			} else {
				const asset = selected.astLoan.asset || null;
				const users = selected.userLoans.map(userLoan => userLoan.user);

				setFieldValue(`returns.${returnIndex}`, createNewReturn(
					selected.value, 
					asset, 
					users, 
					selected.accLoans || [] // search params are reset
				));
			}
		} catch (err) {
			console.error(err);
			handleError('Loan not found');
		}
	}

	const options = [
		{ value: "asset", label: "Asset" },
		{ value: "user", label: "User" },
		{ value: "accessory", label: "Accessory" },
	  ];

	// TODO add validation to not exceed unreturned

	return (
		<FormControl>
  			<FormLabel>Select Type</FormLabel>
			<Flex direction="column" gap={2} position='relative'>
				<Select 
					value={selectedType}
					onChange={handleTypeChange}
				>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
					{option.label}
					</option>
				))}
				</Select>
				{renderDropdown()}
			</Flex>
		</FormControl>
	);
}

// const fetchAsset = useCallback(async (userId = null) => {
// try {
// 	const response = await assetService.fetchAstForUser(userId);
// 	setAccessoryOptions(response.data);
// } catch (err) {
// 	handleError(err);
// 	console.error(err);
// }
// }, [handleError, setAccessoryOptions]); // Dependencies to stabilize fetchAsset