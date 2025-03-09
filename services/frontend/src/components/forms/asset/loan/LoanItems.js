import { useEffect, useState } from "react"
import { SearchCreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../../utils/SelectFormControl"
import { useFormModal } from "../../../../context/ModalProvider"
import { useUI } from "../../../../context/UIProvider"
import accessoryService from "../../../../services/AccessoryService"
import { Button, Flex, VStack, IconButton, Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, HStack, CloseButton, Checkbox, FormControl } from "@chakra-ui/react";
import { FieldArray } from "formik"
import InputFormControl from "../../utils/InputFormControl"
import { ResponsiveText } from "../../../utils/ResponsiveText"
import { useFormikContext } from 'formik';
import { AddButton, RemoveButton } from "../../utils/ItemButtons"
import { useLoan } from "./LoanProvider"
import { v4 as uuidv4 } from 'uuid';
import { useLoans } from "./LoansProvider"
import { createNewAccessory, createNewAsset } from "./LoanUser"
import DateInputControl from "../../utils/DateInputControl"
import { ReturnAstSelectFormControl } from "../return/CustomSelect"
import { LoanAstSelectFormControl } from "./CustomSelect"
import assetService from "../../../../services/AssetService"
import LoanAccessory from "./LoanAccessory"

export const LoanItems = function({ field, loan, children }) {
	
	const { setFieldValue } = useFormikContext();
	const { warnings } = useLoan();
	const { assetOptions } = useLoans();
	const { handleError } = useUI();
	// console.log(warnings);

	const [ suggestedOptions, setSuggestedOptions ] = useState([]);

	useEffect(() => {
		if (!loan?.asset) setSuggestedOptions([]);

		if (!loan.asset.assetId) return;
		const fetchItems = async () => {
			try {
			const response = await accessoryService.getSuggestedAccessories(loan.asset.assetId);
			const suggestedOptions = response.data;
				// console.log(suggestedOptions);
				setSuggestedOptions(suggestedOptions);
			} catch (err) {
				handleError(err);
				console.error(err);
			}
		};
	
		fetchItems();
	}, [loan.asset, handleError, setFieldValue]);

	const updateAssetFields = (selected) => {
		console.log(selected);
		console.log(`${field}.asset.assetId`);
		setFieldValue(`${field}.asset.assetId`, selected?.assetId || '');
		setFieldValue(`${field}.asset.onLoan`, selected?.loan ? true : false);
	}

	const handleSwitchChange = () => {
		if(!loan.excludeAsset) {
			setFieldValue(`${field}.excludeAsset`, true);
			setFieldValue(`${field}.asset`, createNewAsset({}));
		} else {
			setFieldValue(`${field}.excludeAsset`, false);
		}
	}

	return (
		<>
		    <FormControl>
				<Checkbox
					isChecked={loan.excludeAsset}
					onChange={handleSwitchChange}
					colorScheme="red"
					size="lg"
					iconColor="white"
				>
				<ResponsiveText size="sm">No Asset</ResponsiveText>
				</Checkbox>
			</FormControl>
			<Flex direction="column" gap={1} alignItems={'flex-start'}>
				 {/* SECTION ASSET  */}
				{!loan.excludeAsset && 
				<LoanAstSelectFormControl
					name={`${field}.asset.serialNumber`}
					searchFn={value => assetService.fetchAstLoan(value)}
					updateFields={updateAssetFields}
					label={`Serial Number`}
					placeholder="Serial Number"
					initialOptions={assetOptions}
				/>}

				{/* SECTION ACCESSORIES  */}
				<ResponsiveText>Accessories</ResponsiveText>
				<FieldArray name={`${field}.accessories`}>
					{accessoryHelpers => (
						<Box>
							<HStack mb={1}>
								{suggestedOptions && suggestedOptions.length > 0 && (
									suggestedOptions.map((option) => (
										<Button onClick={() => accessoryHelpers.push(createNewAccessory({accessoryTypeId: option.value, accessoryName: option.label}))}/>
									))
								)}
							</HStack>
							{loan.accessories.map((accessory, accessoryIndex, accessoryArray) => 
								<LoanAccessory
									accessory={accessory}
									field={`${field}.accessories.${accessoryIndex}`}
									index={accessoryIndex}
									helpers={accessoryHelpers}
								/>
							)}
							<AddButton
								ariaLabel="Add Accessory"
								handleClick={() => {
									accessoryHelpers.push(createNewAccessory());
								}}
								label={`Add Accessory`}
								size='xs'
							/>
						</Box>
					)}
				</FieldArray>
				<DateInputControl label="Expected Return Date" name={`${field}.expectedReturnDate`} />
				<InputFormControl name={`${field}.remarks`} label={`Loan Remarks`}/>
				{children}
			</Flex>
		</>
	)
}