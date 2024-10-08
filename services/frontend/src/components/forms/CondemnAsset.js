import { Box, Button, Flex, FormControl, FormLabel, Input, Textarea } from "@chakra-ui/react";
import InputFormControl from './utils/InputFormControl';
import ExcelFormControl from './utils/ExcelFormControl';
import FormToggle from "./utils/FormToggle";
import DateInputControl from "./utils/DateInputControl";
import { useFormModal } from "../../context/ModalProvider";
import { useItems } from "../../context/ItemsProvider";
import { SingleSelectFormControl } from "./utils/SelectFormControl";
import { useMemo } from "react";

const CondemnAsset = () => {

  const { handleAssetInputChange, assets } = useFormModal()

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
            <DateInputControl label="Condemned Date" name="condemned-date" />
            <FormToggle
              label="Bookmark Asset"
              name="bookmark-asset"
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

export default CondemnAsset;