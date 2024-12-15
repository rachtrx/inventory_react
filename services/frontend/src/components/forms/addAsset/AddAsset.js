import { useEffect, useState } from "react"
import InputFormControl from "../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl } from "../utils/SelectFormControl";
import { useAddAssets } from "./AddAssetsProvider";
import { Flex } from "@chakra-ui/react";
import DateInputControl from "../utils/DateInputControl";

export const AddAsset = function({ field, asset, cost, setCost, children }) {

	const { setFieldValue } = useFormikContext();
	const { vendorOptions } = useAddAssets();

	// useEffect(() => { // perhaps this is not required TODO
	// 	// update all if any cost changes
	// 	setFieldValue(`${field}.cost`, cost);
	// }, [cost, setFieldValue, field]);

	useEffect(() => {
		//  dont do anything if cost doesnt change or cost is 0 (would have been handled by SubType)
		if (asset.cost === cost || cost === 0) return;

		// deliberate set cost (perhaps ask in future) TODO
		setCost(asset.cost);
	}, [asset.cost, cost, setCost])

	return (
		<Flex direction="column" gap={2}>	
			<InputFormControl
				label={`Asset Tag`}
				name={`${field}.assetTag`} 
				placeholder="Enter asset tag"
			/>
			<InputFormControl
				label={`Serial Number`} 
				name={`${field}.serialNumber`} 
				placeholder="Enter serial number" 
			/>
			<CreatableSingleSelectFormControl
				label={`Vendor`} 
				name={`${field}.vendorName`} 
				updateFields={(selected) => setFieldValue(`${field}.vendorId`, selected?.vendorId || '')}
				initialOptions={vendorOptions} 
				placeholder="Enter vendor" 
			/>
			<InputFormControl
				label={`Cost`} 
				name={`${field}.cost`} 
				type="number"
				placeholder="Enter cost" 
			/>
			<DateInputControl label="Added Date" name={`${field}.addDate`} />
			<InputFormControl label={`Remarks for asset`} name={`${field}.remarks`}/>
			{/* Include the helper functions */}
			{children}
		</Flex>
	)
}