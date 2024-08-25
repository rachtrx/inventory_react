import { Box, Flex } from "@chakra-ui/react";
import InputFormControl from './utils/InputFormControl';
import ExcelFormControl from './utils/ExcelFormControl';
import DateInputControl from "./utils/DateInputControl";
import FormToggle from "./utils/FormToggle";
import { useItems } from "../../context/ItemsProvider";
import { useFormModal } from "../../context/ModalProvider";
import { MultiSelectFormControl } from "./utils/SelectFormControl";
import { SingleSelectFormControl } from "./utils/SelectFormControl";
import { useMemo, useState } from "react";
import Toggle from "./utils/Toggle";

const RemoveUser = () => {

    const fieldsToReset = useMemo(() => [
      'model', 'vendor', 'serial-number', 'asset-tag', 'value', 'remarks'
    ], []);

  return (
    <Box width="100%" maxWidth="500px" mx="auto" p={4}>
      <Flex direction="column" gap={4}>
            <SingleSelectFormControl 
                name="user-id"
                label="Name"
                placeholder="Name"
            />
            <DateInputControl label="Removed Date" name="removed-date" />
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

export default RemoveUser;