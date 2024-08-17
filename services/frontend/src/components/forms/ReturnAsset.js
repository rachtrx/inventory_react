import { Box, Flex } from "@chakra-ui/react";
import ExcelToggle from "./utils/ExcelToggle";
import ExcelFormControl from './utils/ExcelFormControl';
import InputFormControl from './utils/InputFormControl';
import SelectFormControl from "./utils/SelectFormControl";
import DateInputControl from "./utils/DateInputControl";
import FormToggle from "./utils/FormToggle";
import { useFormModal } from "../../context/ModalProvider";
import { useGlobal } from "../../context/GlobalProvider";
import { SingleSelectFormControl } from "./utils/SelectFormControl";
import { useMemo } from "react";

const ReturnAsset = () => {

    const { isExcel, handleAssetInputChange, assets } = useFormModal()
    const { assetFilters } = useGlobal()

    const fieldsToReset = useMemo(() => ['asset-tag', 'remarks'], []);

  return (
    <Box width="100%" maxWidth="500px" mx="auto" p={4}>
      <Flex direction="column" gap={4}>

        <ExcelToggle fieldsToReset={fieldsToReset}/>

        {isExcel ? (
          <ExcelFormControl expectedKeys={null}/>
        ) : (
          <>
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
            </>
        )}
      </Flex>
    </Box>
  );
};

export default ReturnAsset;