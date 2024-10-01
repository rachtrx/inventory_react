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

const ReturnStep1 = ({ nextStep, formData, setFormData }) => {

    // REINITIALISE FORM TO INCLUDE ALL POSSIBLE UPDATES
    const { setFormType, reinitializeForm } = useFormModal();

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
						userNames: record.userNames
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
  
    const { handleAssetInputChange, assets } = useFormModal()
    const { assetFilters } = useItems()
  
    const fieldsToReset = useMemo(() => ['asset-tag', 'remarks'], []);
  
    return (
      <Box width="100%" maxWidth="500px" mx="auto" p={4}>
        <Flex direction="column" gap={4}>
  
              <SingleSelectFormControl
                name="asset-tag"
                label="Asset Tag"
                placeholder="Asset Tag"
                options={assets}
                onInputChange={(value) => {handleAssetInputChange(value)}}
              />
              <SingleSelectFormControl
                name="user-name"
                label="User Name"
                placeholder="User Name"
                disabled={true}
              />
              <DateInputControl label="Returned Date" name="returned-date" />
              <FormToggle
                label="Bookmark Asset"
                name="bookmark-asset"
                value={true}
              />
              <FormToggle
                label="Bookmark User"
                name="bookmark-user"
                value={true}
              />
              <InputFormControl
                name="remarks"
                label="Remarks"
                placeholder="Add remarks"
              />
        </Flex>
      </Box>
    );
  };
  
  export default ReturnStep1;