import { Box, Button, Flex } from "@chakra-ui/react"
import { CreatableMultiSelectFormControl, SingleSelectFormControl } from "./utils/SelectFormControl"
import { updateOptions, useFormModal } from "../../context/ModalProvider"
import FormToggle from "./utils/FormToggle"
import InputFormControl from "./utils/InputFormControl"
import { useCallback, useEffect, useState } from "react"
import { ResponsiveText } from "../utils/ResponsiveText"
import { FieldArray } from "formik"
import peripheralService from "../../services/PeripheralService"
import { useUI } from "../../context/UIProvider"
import { LoanAssetPeripherals } from "./LoanAssetPeripherals"

export const LoanAssetsArray = ({fieldArrayName, assets, newAssetFields}) => {

	return (
		<FieldArray name={fieldArrayName}>
			{assetHelpers => assets.map((_, assetIndex, array) => (
				<Flex direction="column" key={assetIndex} gap={4} p={2} _hover={{ bg: "blue.50" }}>
					<LoanAssetPeripherals
						fieldArrayName={fieldArrayName}
						assetIndex={assetIndex}
						peripherals={assets[assetIndex].peripherals}
					/>
					<InputFormControl name={`${fieldArrayName}.${assetIndex}.remarks`} label="Remarks" placeholder="Add remarks" />
					<FormToggle label="Bookmark Asset" name={`${fieldArrayName}.${assetIndex}.bookmarked`}/>
					<Flex justifyContent="flex-start" gap={2} marginBottom={4}>
						{assets.length > 1 && (
							<Button type="button" onClick={() => assetHelpers.remove(assetIndex)}>
								<ResponsiveText>Remove Asset</ResponsiveText>
							</Button>
						)}
						{assetIndex === array.length - 1 && (
							<Button
								type="button"
								onClick={() => assetHelpers.push(newAssetFields)}
							>
								<ResponsiveText>Add Asset</ResponsiveText>
							</Button>
						)}
					</Flex>
				</Flex>
			))}
		</FieldArray>
	)
}