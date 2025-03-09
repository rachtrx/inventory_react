import { useEffect, useState } from "react"
import InputFormControl from "../../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../../utils/SelectFormControl";
import { useDelAssets } from "./DelAssetsProvider";
import { Flex } from "@chakra-ui/react";
import DateInputControl from "../../utils/DateInputControl";
import { useFormModal } from "../../../../context/ModalProvider";
import { LoanAstSelectFormControl } from "../loan/CustomSelect";
import assetService from "../../../../services/AssetService";

export const DelAsset = function({ field, asset, children }) {

	const { assetOptions } = useDelAssets();
	const { setFieldValue } = useFormikContext();

	const updateAssetFields = async (selected) => {
        if (!selected || selected.assetId) {
            setFieldValue(`${field}.assetId`, selected?.assetId || '');
            setFieldValue(`${field}.lastEventDate`, selected?.lastEventDate || '');
        } 
    };

	return (
		<Flex direction="column" gap={2}>	
			<LoanAstSelectFormControl
				name={`${field}.serialNumber`}
				searchFn={value => assetService.fetchAstDel(value)}
				updateFields={(selected) => updateAssetFields(selected)}
				label={`Asset Tag`}
				placeholder="Asset Tag"
				initialOptions={assetOptions}
			/>
			<DateInputControl label="Delete Date" name={`${field}.delDate`} />
			<InputFormControl label={`Remarks for asset`} name={`${field}.remarks`}/>
			{/* Include the helper functions */}
			{children}
		</Flex>
	)
}