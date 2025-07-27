import { useEffect } from "react"
import InputFormControl from "../../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl } from "../../utils/SelectFormControl";
import { useAddAssets } from "./AddAssetsProvider";
import { Flex } from "@chakra-ui/react";
import DateInputControl from "../../utils/DateInputControl";
import WarningCard from "../../utils/WarningCard";
import RemarksFormControl from "../../utils/RemarksFormControl";

export const AddAsset = function({ field, asset, cost, setCost, children }) {

	const { setFieldValue } = useFormikContext();
	const { vendorOptions, addNewVendor, locationOptions } = useAddAssets();

	useEffect(() => {
		//  dont do anything if cost doesnt change or cost is 0 (would have been handled by SubType)
		if (asset.cost === cost || cost === 0) return;

		// deliberate set cost (perhaps ask in future) TODO
		setCost(asset.cost);
	}, [asset.cost, cost, setCost])

	useEffect(() => {
		console.log(vendorOptions);
		if (!asset.vendorName || asset.vendorId) return;
		const matchedOption = vendorOptions.find(option => option.vendorId && option.value === asset.vendorName);
		if(matchedOption) setFieldValue(`${field}.vendorId`, matchedOption.vendorId);
	}, [vendorOptions, setFieldValue, asset, field]);

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
				label={`Vendor`} 
				name={`${field}.vendorName`} 
				updateFields={(selected) => setFieldValue(`${field}.vendorId`, selected?.vendorId || '')}
				initialOptions={vendorOptions} 
				placeholder="Enter vendor" 
			/>
			{asset.vendorName && !asset.vendorId && 
				<WarningCard
					message={`Create ${asset.vendorName}?`}
					items={vendorOptions}
					itemAttr="value"
					onCreate={() => addNewVendor(asset.vendorName)}
				/>
			}
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
				initialOptions={locationOptions}
			/>
			<RemarksFormControl label={`Remarks for asset`} name={`${field}.remarks`}/>
			{/* Include the helper functions */}
			{children}
		</Flex>
	)
}