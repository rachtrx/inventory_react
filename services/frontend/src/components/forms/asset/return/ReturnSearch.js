import { Flex, FormControl, FormLabel } from "@chakra-ui/react"
import React, { useCallback, useEffect, useMemo, useState } from "react"
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
	// accessoryLoanId: accLoan.accessoryLoanId || '',
	accessoryTypeId: accLoan.accType.accessoryTypeId || '',
	accessoryName: accLoan.accType.accessoryName || '',
	unreturned: accLoan.unreturned,
	count: accLoan.unreturned,
  });

const createNewAsset = (assetLoan={}) => ({
	assetId: assetLoan.asset?.assetId || '',
	serialNumber: assetLoan.asset?.serialNumber || '',
	unreturned: assetLoan.returnEventId ? 0 : 1,
	count: assetLoan.returnEventId ? 0 : 1,
})

export const createNewReturn = ({
	loanId = null, 
	astLoan = {}, 
	user = {},
	// newUser = {},
	accLoans = [],
	remarks = null,
	search = ""
} = {}) => ({
	key: uuidv4(),
	loanId: loanId || null,
	asset: createNewAsset(astLoan || {}),
	accessoryTypes: accLoans?.map((accLoan) => createNewAccessory(accLoan)) || [],
	userId: user.userId || user.userId || '',
	userName: user.userName || '',
	// newUser: createNewUser(newUser),
	remarks: remarks || '',
	search: search,
});

export const ReturnSearch = () => {

	const { setUserOptions } = useReturns();
	const { ret, returnIndex, currentLoan, returnOptions } = useReturn();
	const { setFieldValue } = useFormikContext();
	const { handleError } = useUI();
	const [selectedType, setSelectedType] = useState("asset");

	const handleTypeChange = (event) => {
		setSelectedType(event.target.value);
	  };
	
	const updateDetailsFromLoan = useCallback(async (returnIndex, selected) => {
		try {
			console.log(selectedType);
			if (!selected?.value) {
				console.log(selectedType);
				setFieldValue(`returns.${returnIndex}.loanId`, "")
				setFieldValue(`returns.${returnIndex}.asset`, createNewAsset())
				setFieldValue(`returns.${returnIndex}.userId`, "")
				setFieldValue(`returns.${returnIndex}.userName`, "")
				setFieldValue(`returns.${returnIndex}.accessoryTypes`, []);
				setFieldValue(`returns.${returnIndex}.remarks`, "");
				return;
			}

			console.log(selected.value);

			setUserOptions((prevOptions) => [
				...prevOptions, // Include previous user options
				{
				  ...selected.user,
				  value: selected.user.userName,
				  label: selected.user.userName,
				},
			  ]);
			  
	
			setFieldValue(`returns.${returnIndex}.loanId`, selected.value)
			setFieldValue(`returns.${returnIndex}.asset`, createNewAsset(selected.astLoan))
			setFieldValue(`returns.${returnIndex}.userId`, selected.user.userId)
			setFieldValue(`returns.${returnIndex}.userName`, selected.user.userName)
			setFieldValue(`returns.${returnIndex}.accessoryTypes`, selected.accLoans.map(accLoan => createNewAccessory(accLoan)));
		} catch (err) {
			console.error(err);
			handleError('Loan not found');
		}
	}, [setFieldValue, handleError, setUserOptions, selectedType]);

	const renderedDropdown = useMemo(() => {
		switch (selectedType) {
		  case "asset":
			return (
			  <ReturnAstSelectFormControl
				name={`returns.${returnIndex}.search`}
				updateFields={(selected) => updateDetailsFromLoan(returnIndex, selected)}
				searchFn={(value) => assetService.fetchAstReturn(value)}
				placeholder="Serial Number"
				isDisabled={currentLoan}
				initialOptions={returnOptions}
			  />
			);
		  case "user":
			return (
			  <ReturnUsrSelectFormControl
				name={`returns.${returnIndex}.search`}
				updateFields={(selected) => updateDetailsFromLoan(returnIndex, selected)}
				searchFn={(value) => userService.fetchUserReturn(value)}
				placeholder="User(s)"
				isDisabled={currentLoan}
				initialOptions={returnOptions}
			  />
			);
		  case "accessory":
			return (
			  <ReturnAccSelectFormControl
				name={`returns.${returnIndex}.search`}
				updateFields={(selected) => updateDetailsFromLoan(returnIndex, selected)}
				searchFn={(value) => accessoryService.fetchAccReturn(value)}
				placeholder="Accessory"
				isDisabled={currentLoan}
				initialOptions={returnOptions}
			  />
			);
		  default:
			return null;
		}
	}, [selectedType, returnIndex, currentLoan, returnOptions, updateDetailsFromLoan]);

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
				{renderedDropdown}
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