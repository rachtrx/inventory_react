import { Box, Flex } from "@chakra-ui/react";
import ExcelToggle from "./utils/ExcelToggle";
import InputFormControl from './utils/InputFormControl';
import ExcelFormControl from './utils/ExcelFormControl';
import SelectFormControl from "./utils/SelectFormControl";
import DateInputControl from "./utils/DateInputControl";
import FormToggle from "./utils/FormToggle";
import { useItems } from "../../context/ItemsProvider";
import { useFormModal } from "../../context/ModalProvider";
import { MultiSelectFormControl } from "./utils/SelectFormControl";
import { SingleSelectFormControl } from "./utils/SelectFormControl";
import { useMemo } from "react";

const AddAsset = () => {

    const { isExcel } = useFormModal()
    const { assetFilters, userFilters } = useItems()

    const fieldsToReset = useMemo(() => [
      'model', 'vendor', 'serial-number', 'asset-tag', 'value', 'remarks'
    ], []);

  return (
    <Box width="100%" maxWidth="500px" mx="auto" p={4}>
      <Flex direction="column" gap={4}>

        <ExcelToggle fieldsToReset={fieldsToReset} />
        {isExcel ? (
          <ExcelFormControl expectedKeys={null}/>
        ) : (
          <>
            <SingleSelectFormControl
              name="model"
              label="Model Name"
              placeholder="Model Name"
            />
            <SingleSelectFormControl 
                name="vendor"
                label="Vendor"
                placeholder="Vendor"
                options={assetFilters.vendors}
            />
            <InputFormControl
              name="serial-number"
              label="Serial Number"
              placeholder="Serial Number"
            />
            <InputFormControl
              name="asset-tag"
              label="Asset Tag"
              placeholder="Asset Tag"
            />
            <InputFormControl
              name="value"
              label="Value"
              placeholder="Value"
            />
            <DateInputControl label="Added Date" name="registered-date" />
            <SingleSelectFormControl
              name="user-name"
              label="User Name"
              placeholder="User Name"
            />
            <DateInputControl label="Loan Date" name="loaned-date" />
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
          </>
        )}
      </Flex>
    </Box>
  );
};

export default AddAsset;