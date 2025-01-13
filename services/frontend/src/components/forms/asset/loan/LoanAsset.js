import { useEffect, useState } from "react"
import { SearchCreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../../utils/SelectFormControl"
import { useFormModal } from "../../../../context/ModalProvider"
import { useUI } from "../../../../context/UIProvider"
import accessoryService from "../../../../services/AccessoryService"
import { Button, Flex, VStack, IconButton, Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, HStack, CloseButton } from "@chakra-ui/react";
import { FieldArray } from "formik"
import InputFormControl from "../../utils/InputFormControl"
import { ResponsiveText } from "../../../utils/ResponsiveText"
import { useFormikContext } from 'formik';
import { AddButton, RemoveButton } from "../../utils/ItemButtons"
import { useLoan } from "./LoanProvider"
import { v4 as uuidv4 } from 'uuid';
import { useLoans } from "./LoansProvider"
import { createNewAccessory } from "./Loan"
import DateInputControl from "../../utils/DateInputControl"

export const LoanAsset = function({ loanIndex, asset }) {

	// console.log('loan asset');

	const { handleAssetSearch } = useFormModal()
	
	const { values, setFieldValue } = useFormikContext();
	const { mode, warnings } = useLoan();
	const { assetOptions } = useLoans()
	console.log(warnings);

	const updateAssetFields = (loanIndex, selected) => {
		setFieldValue(`loans.${loanIndex}.asset.assetId`, selected?.assetId || '');
		setFieldValue(`loans.${loanIndex}.asset.shared`, selected?.shared || '');
	}

	return (
		<>
			<Flex gap={4} alignItems={'flex-start'}>
				<SearchSingleSelectFormControl
					name={`loans.${loanIndex}.asset.serialNumber`}
					searchFn={value => handleAssetSearch(value, mode)}
					updateFields={(selected) => updateAssetFields(loanIndex, selected)}
					label={`Serial Number`}
					placeholder="Serial Number"
					initialOptions={assetOptions}
				/>
			</Flex>
			<InputFormControl name={`loans.${loanIndex}.remarks`} label={`Loan Remarks`}/>
		</>
	)
}