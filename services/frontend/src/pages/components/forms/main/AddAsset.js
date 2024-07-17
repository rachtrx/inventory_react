import { Box, Flex } from "@chakra-ui/react";
import InputFormControl from '../utils/InputFormControl';
import ExcelToggle from "../utils/ExcelToggle";
import ExcelFormControl from '../utils/ExcelFormControl';
import { useModal } from "../../../../context/ModalProvider";
import SelectFormControl from "../utils/SelectFormControl";
import { useAsset } from "../../../../context/AssetProvider";
import DateInputControl from "../utils/DateInputControl";
import FormToggle from "../utils/FormToggle";

const AddAsset = () => {

    const { isExcel } = useModal()
    const { filters } = useAsset()

  return (
    <Box width="100%" maxWidth="500px" mx="auto" p={4}>
      <Flex direction="column" gap={4}>

        <ExcelToggle fieldsToReset={['model', 'vendor', 'serial-number', 'asset-tag', 'value', 'remarks']}/>

        {isExcel ? (
          <ExcelFormControl expectedKeys={null}/>
        ) : (
          <>
            <InputFormControl
              name="model"
              label="Model Name"
              placeholder="Model Name"
            />
            <SelectFormControl 
                name="vendor"
                label="Vendor"
                placeholder="Vendor"
                options={filters.vendors}
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
            <DateInputControl label="Registered Date" name="registered-date" />
            <InputFormControl
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