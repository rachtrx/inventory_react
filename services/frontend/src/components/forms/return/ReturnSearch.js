import { Box, Flex, FormControl, FormLabel } from "@chakra-ui/react"
import { useCallback, useMemo, useState } from "react"
import { useReturn } from "./ReturnProvider"
import { useReturns } from "./ReturnsProvider"
import { useUI } from "../../../context/UIProvider"
import { ReturnAccSelectFormControl, ReturnAstSelectFormControl, ReturnUsrSelectFormControl } from "../options/ReturnOptions"
import { Select } from "@chakra-ui/react";
import { useFormikContext } from "formik";
import loanService from "../../../services/LoanService";
import { useLocation } from "react-router-dom";
import { createNewAccessory, createNewAsset } from "./helpers"

export const ReturnSearch = () => {

	const { setUserOptions, returnOptions } = useReturns();
	const { returnIndex, currentLoan } = useReturn();
	const { setFieldValue } = useFormikContext();
	const { handleError } = useUI();
	
	const location = useLocation();
	const initialSearchType = useMemo(() => {
		if (location.pathname.includes('users')) {
			return 'user'
		} else if (location.pathname.includes('accessories')) {
			return 'accessory'
		} else {
			return 'asset'
		}
	}, [location.pathname]);
	const [selectedType, setSelectedType] = useState(initialSearchType);

	const handleTypeChange = (event) => {
		setSelectedType(event.target.value);
	  };
	
	const updateDetailsFromLoan = useCallback(async (returnIndex, selected) => {
		try {
			console.log(selectedType);
			console.log(selected);
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

			if (selected.isDisabled || !selected.user) return;

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
				handleClick={(selected) => updateDetailsFromLoan(returnIndex, selected)}
				searchFn={(value) => loanService.fetchAstReturn(value)}
				placeholder="Serial Number"
				isDisabled={currentLoan}
				options={returnOptions}
			  />
			);
		  case "user":
			return (
			  <ReturnUsrSelectFormControl
				name={`returns.${returnIndex}.search`}
				handleClick={(selected) => updateDetailsFromLoan(returnIndex, selected)}
				searchFn={(value) => loanService.fetchUserReturn(value)}
				placeholder="User(s)"
				isDisabled={currentLoan}
				options={returnOptions}
			  />
			);
		  case "accessory":
			return (
			  <ReturnAccSelectFormControl
				name={`returns.${returnIndex}.search`}
				handleClick={(selected) => updateDetailsFromLoan(returnIndex, selected)}
				searchFn={(value) => loanService.fetchAccReturn(value)}
				placeholder="Accessory"
				isDisabled={currentLoan}
				options={returnOptions}
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
			<Flex gap={2} position='relative'>
				<Box flex="1">
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
				</Box>
				<Box flex="2">
					{renderedDropdown}
				</Box>
			</Flex>
		</FormControl>
	);
}
