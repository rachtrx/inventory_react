import { Box, Flex } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import InputFormControl from '../utils/InputFormControl';
import SelectFormControl from "../utils/SelectFormControl";
import DateInputControl from "../utils/DateInputControl";
import FormToggle from "../utils/FormToggle";
import { useFormModal } from "../../../context/ModalProvider";
import { useItems } from "../../../context/ItemsProvider";
import { SingleSelectFormControl } from "../utils/SelectFormControl";
import { useEffect, useMemo, useState } from "react";
import ReturnStep1 from "./ReturnStep1";
import { ReturnStep2 } from "./ReturnStep2";
import { useUI } from "../../../context/UIProvider";
import { createNewReturn } from "./Return";
import assetService from "../../../services/AssetService";
import { ReturnsProvider, useReturns } from "./ReturnsProvider";

const Returns = () => {

    const { step } = useReturns();

  return (
    <Box>
      
    </Box>
  );
};

export default Returns;