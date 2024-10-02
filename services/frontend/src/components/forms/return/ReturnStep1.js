import { Box, Flex } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import InputFormControl from '../utils/InputFormControl';
import SelectFormControl from "../utils/SelectFormControl";
import DateInputControl from "../utils/DateInputControl";
import FormToggle from "../utils/FormToggle";
import { useFormModal } from "../../../context/ModalProvider";
import { useItems } from "../../../context/ItemsProvider";
import { SingleSelectFormControl } from "../utils/SelectFormControl";
import { useEffect, useMemo, useRef } from "react";
import { createNewReturn } from "./Return";
import { useUI } from "../../../context/UIProvider";

const ReturnStep1 = ({ nextStep, formData, setFormData, fetchReturn }) => {

    // REINITIALISE FORM TO INCLUDE ALL POSSIBLE UPDATES
    const { setFormType, reinitializeForm } = useFormModal();
		const { handleError } = useUI()

    const formRef = useRef(null);
    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm])

    const setValuesExcel = (records) => {
			try {
				const groupedRecords = records.reduce((acc, record) => {
					const assetTag = record.assetTag?.trim();
					if (acc[assetTag]) {
						throw new Error(`Duplicate records for assetTag: ${assetTag} were found`);
					}

					acc[assetTag] = {
						users: record.userNames
							? [...new Set(record.userNames.split(',').map(user => user.trim()))]
							: [],
						peripherals: Object.entries(peripherals).map(([name, count]) => ({peripheralName: name, count: count}))
					};
			
					return acc;
				}, {});
			
				// Convert grouped records into loans
				const loans = Object.entries(groupedRecords).map(([assetTag, { userNames, peripherals }]) =>
					createNewReturn(
						assetTag,
						userNames,
						peripherals,
					)
				);
			
				console.log(loans);
			
				setFormData({
					loans: loans
				});
			} catch (error) {
				handleError(error);
			}
    };
  
    
  };
  
  export default ReturnStep1;