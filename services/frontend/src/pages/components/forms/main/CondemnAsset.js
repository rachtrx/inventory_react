import { Box, Button, Flex, FormControl, FormLabel, Input, Textarea } from "@chakra-ui/react";
import InputFormControl from '../utils/InputFormControl';
import ExcelFormControl from '../utils/ExcelFormControl';
import ExcelToggle from "../utils/ExcelToggle";
import { useModal } from "../../../../context/ModalProvider";
import FormToggle from "../utils/FormToggle";
import DateInputControl from "../utils/DateInputControl";

const CondemnAsset = () => {

  const { isExcel } = useModal()

  return (
    <Box width="100%" maxWidth="500px" mx="auto" p={4}>

      <Flex direction="column" gap={4}>
      <ExcelToggle fieldsToReset={['asset-tag', 'remarks']}/>

        {isExcel ? (
          <ExcelFormControl expectedKeys={null}/>
        ) : (
          <>
            <InputFormControl
              name="asset-tag"
              label="Asset Tag"
              placeholder="Asset Tag"
            />
            <DateInputControl label="Condemned Date" name="condemned-date" />
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

export default CondemnAsset;