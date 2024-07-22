import { Box, Flex } from "@chakra-ui/react";
import ExcelToggle from "./utils/ExcelToggle";
import InputFormControl from './utils/InputFormControl';
import ExcelFormControl from './utils/ExcelFormControl';
import SelectFormControl from "./utils/SelectFormControl";
import DateInputControl from "./utils/DateInputControl";
import FormToggle from "./utils/FormToggle";
import { useFormModal, actionTypes } from "../../context/ModalProvider";
import { useGlobal } from "../../context/GlobalProvider";
import { SingleSelectFormControl } from "./utils/SelectFormControl";
import { useMemo } from "react";

const LoanAsset = () => {

    const { isExcel, assets, handleAssetInputChange, users, handleUserInputChange } = useFormModal()

    const fieldsToReset = useMemo(() => ['asset-tag', 'user-name', 'remarks'], []);

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
              options={assets}
              placeholder="Asset Tag"
              onInputChange={(value) => {handleAssetInputChange(value)}}
            />
            <SingleSelectFormControl
              name="user-name"
              label="User Name"
              options={users}
              placeholder="User Name"
              onInputChange={(value) => {handleUserInputChange(value)}}
            />
            <DateInputControl label="Loaned Date" name="loaned-date" />
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

export default LoanAsset;