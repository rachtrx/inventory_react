import { Box, Flex } from "@chakra-ui/react";
import ExcelToggle from "./utils/ExcelToggle";
import InputFormControl from './utils/InputFormControl';
import ExcelFormControl from './utils/ExcelFormControl';
import SelectFormControl from "./utils/SelectFormControl";
import DateInputControl from "./utils/DateInputControl";
import FormToggle from "./utils/FormToggle";
import { useGlobal } from "../../context/GlobalProvider";
import { useFormModal } from "../../context/ModalProvider";
import { MultiSelectFormControl } from "./utils/SelectFormControl";
import { SingleSelectFormControl } from "./utils/SelectFormControl";
import { useMemo, useState } from "react";
import Toggle from "./utils/Toggle";

const AddUser = () => {

    const { isExcel } = useFormModal()
    const { assetFilters, userFilters } = useGlobal()
    const [ isSelectDept, setIsSelectDept ] = useState(true)

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
            <Toggle
              label="New Dept"
              check_fn={() => setIsSelectDept(true)}
              uncheck_fn={() => setIsSelectDept(false)}
            />

            { isSelectDept ?
            <SingleSelectFormControl
              name="dept"
              label="Department"
              placeholder="Department"
            /> :
            <InputFormControl
              name="new-dept"
              label="Department"
              placeholder="Department"
            />}

            <InputFormControl 
                name="user-name"
                label="Name"
                placeholder="Name"
            />
            <DateInputControl label="Added Date" name="added-date" />
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

export default AddUser;