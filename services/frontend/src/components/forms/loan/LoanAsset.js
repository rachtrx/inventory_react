import { useEffect, useState } from "react"
import { SearchCreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import { useUI } from "../../../context/UIProvider"
import accessoryService from "../../../services/AccessoryService"
import { Button, Flex, VStack, IconButton, Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, HStack, CloseButton } from "@chakra-ui/react";
import { FieldArray } from "formik"
import InputFormControl from "../utils/InputFormControl"
import { ResponsiveText } from "../../utils/ResponsiveText"
import { useFormikContext } from 'formik';
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { useLoan } from "./LoanProvider"
import { v4 as uuidv4 } from 'uuid';
import { useLoans } from "./LoansProvider"
import { createNewAccessory } from "./Loan"
import DateInputControl from "../utils/DateInputControl"

export const LoanAsset = function({ loanIndex, asset }) {

	// console.log('loan asset');

	const { handleAssetSearch, handleAccessorySearch } = useFormModal()
	const [ suggestedOptions, setSuggestedOptions ] = useState()
	const { values, setFieldValue } = useFormikContext();
	const { handleError } = useUI();
	const { mode, setMode, warnings } = useLoan();
	const { assetOptions, accessoryOptions } = useLoans()
	console.log(warnings);

	useEffect(() => {
		if (!asset.assetId || asset.assetTag === asset.assetId) return;
		const fetchItems = async () => {
			try {
			const response = await accessoryService.getSuggestedAccessories(asset.assetId);
			const suggestedOptions = response.data;
				console.log(suggestedOptions);  
				setSuggestedOptions(suggestedOptions);
			} catch (err) {
				handleError(err);
				console.error(err);
			}
		};
	
		fetchItems();
	}, [asset, handleError, setFieldValue]);

	const updateAssetFields = (loanIndex, selected) => {
		setFieldValue(`loans.${loanIndex}.asset.assetId`, selected?.assetId || '');
		setFieldValue(`loans.${loanIndex}.asset.shared`, selected?.shared || '');
	}

	const updateAccessoryFields = (loanIndex, accessoryIndex, selected) => {
		setFieldValue(`loans.${loanIndex}.asset.accessories.${accessoryIndex}.accessoryTypeId`, selected?.accessoryTypeId || '');
	}

	return (
		<>
			<Flex gap={4} alignItems={'flex-start'}>
				<SearchSingleSelectFormControl
					name={`loans.${loanIndex}.asset.assetTag`}
					searchFn={value => handleAssetSearch(value, mode)}
					updateFields={(selected) => updateAssetFields(loanIndex, selected)}
					label={`Asset Tag`}
					placeholder="Asset Tag"
					initialOptions={assetOptions}
				/>
			</Flex>
			{asset && asset.assetTag && 
				<InputFormControl name={`loans.${loanIndex}.asset.remarks`} label={`Loan Remarks for ${asset.assetTag}`}/>
			}
			
			<FieldArray name={`loans.${loanIndex}.asset.accessories`}>
				{accessoryHelpers => (
					<Box>
						<HStack mb={1}>
							{suggestedOptions && suggestedOptions.length > 0 && (
								suggestedOptions.map((option) => (
									<Button onClick={() => accessoryHelpers.push(createNewAccessory({accessoryTypeId: option.value, accessoryName: option.label}))}/>
								))
							)}
						</HStack>
						{asset.accessories && asset.accessories.length > 0 && asset.accessories.map((accessory, index, array) => {
							// console.log(fieldName);
							return (
								<Box key={accessory.key}>
									<SearchCreatableSingleSelectFormControl
										name={`loans.${loanIndex}.asset.accessories.${index}.accessoryName`}
										searchFn={handleAccessorySearch}
										updateFields={(selected) => updateAccessoryFields(loanIndex, index, selected)}
										warning={warnings?.accessories?.[index]?.id || null}
										initialOptions={accessoryOptions}
									>
										<InputFormControl
											name={`loans.${loanIndex}.asset.accessories.${index}.count`} 
											type="number" 
											placeholder="Enter count" 
										/>
										<RemoveButton
											ariaLabel="Remove Accessory"
											handleClick={() => accessoryHelpers.remove(index)}
										/>
									</SearchCreatableSingleSelectFormControl>
								</Box>
							)
						})}
						{(asset.assetId || asset.accessories) && (
							<AddButton
								ariaLabel="Add Accessory"
								handleClick={() => {
									console.log('Before push:', values);
									accessoryHelpers.push(createNewAccessory());
									console.log('After push:', values);
								}}
								label={`Add Accessory`}
								size='xs'
							/>
						)}
					</Box>
				)}
			</FieldArray>
		</>
	)
}