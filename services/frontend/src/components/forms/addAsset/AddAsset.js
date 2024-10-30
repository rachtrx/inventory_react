import { useEffect, useState } from "react"
import InputFormControl from "../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl } from "../utils/SelectFormControl";
import { useAddAssets } from "./AddAssetsProvider";

export const AddAsset = function({ field, asset, cost, setCost, children }) {

	const { setFieldValue } = useFormikContext();
	const { vendorOptions } = useAddAssets();

	useEffect(() => {
		// update all if any cost changes
		setFieldValue(`${field}.cost`, cost);
	}, [cost, setFieldValue, field]);

	useEffect(() => {
		//  dont do anything if cost doesnt change or cost is 0 (would have been handled by SubType)
		if (asset.cost === cost || cost === 0) return;

		// deliberate set cost (perhaps ask in future) TODO
		setCost(asset.cost);
	}, [asset.cost, cost, setCost])

	return (
		<>	
			<InputFormControl
				name={`${field}.assetTag`} 
				type="number" 
				placeholder="Enter asset tag" 
			/>
			<InputFormControl
				name={`${field}.serialNumber`} 
				type="number" 
				placeholder="Enter serial number" 
			/>
			<CreatableSingleSelectFormControl
				name={`${field}.vendor`} 
				updateFields={(selected) => setFieldValue(`${field}.vendorId`, selected?.subTypeName || '')}
				initialOptions={vendorOptions} 
				placeholder="Enter vendor" 
			/>
			<InputFormControl
				name={`${field}.cost`} 
				type="number"
				placeholder="Enter cost" 
			/>
			<InputFormControl name={`${field}.remarks`} label={`Remarks for ${asset.assetTag}`}/>
			{/* Include the helper functions */}
			{children}
		</>
	)
}