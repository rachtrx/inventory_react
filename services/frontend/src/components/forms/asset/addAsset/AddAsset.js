import { useEffect } from "react"
import InputFormControl from "../../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl } from "../../utils/SelectFormControl";
import { useAddAssets } from "./AddAssetsProvider";
import { Flex } from "@chakra-ui/react";
import DateInputControl from "../../utils/DateInputControl";
import RemarksFormControl from "../../utils/RemarksFormControl";

export const AddAsset = function({ field, asset, cost, setCost, children }) {

	const { setFieldValue } = useFormikContext();
	const { vendorOptions, addNewVendor, locationOptions, setVendorOptions, setLocationOptions } = useAddAssets();

	console.log(asset);

	useEffect(() => {
		//  dont do anything if cost doesnt change or cost is 0 (would have been handled by SubType)
		if (asset.cost === cost || cost === 0) return;

		// deliberate set cost (perhaps ask in future) TODO
		setCost(asset.cost);
	}, [asset.cost, cost, setCost])

	const updateVendor = (selected) => {
		setFieldValue(`${field}.vendorId`, selected?.vendorId || '')
	}

	return (
		<Flex direction="column" gap={2}>
			<InputFormControl
				label={`Asset Tag`}
				name={`${field}.alias`} 
				placeholder="Enter Asset Tag"
			/>
			<InputFormControl
				label={`Serial Number`}
				name={`${field}.serialNumber`}
				placeholder="Enter serial number" 
			/>
			<CreatableSingleSelectFormControl
				name={`${field}.vendorName`}
				label={`Vendor`} 
				placeholder="Enter vendor"
				handleClick={updateVendor}
				options={vendorOptions}
				setOptions={setVendorOptions}
				onCreate={addNewVendor}
				trueKey="vendorId"
			/>
			<InputFormControl
				label={`Cost`} 
				name={`${field}.cost`} 
				type="number"
				placeholder="Enter cost" 
			/>
			<DateInputControl label="Added Date" name={`${field}.addDate`} />
			<CreatableSingleSelectFormControl
				name={`${field}.location`}
				label={`Location`}
				placeholder="Select Location"
				options={locationOptions}
				setOptions={setLocationOptions}
			/>
			<RemarksFormControl label={`Remarks for asset`} name={`${field}.remarks`}/>
			{/* Include the helper functions */}
			{children}
		</Flex>
	)
}