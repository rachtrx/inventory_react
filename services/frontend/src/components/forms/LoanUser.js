import { useEffect, useState } from "react"
import { SearchCreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "./utils/SelectFormControl"
import { useFormModal } from "../../context/ModalProvider"
import { useUI } from "../../context/UIProvider"
import peripheralService from "../../services/PeripheralService"
import { IconButton } from "@chakra-ui/react";
import { MdRemoveCircleOutline, MdSave } from 'react-icons/md';
import { FieldArray } from "formik"
import InputFormControl from "./utils/InputFormControl"
import { ResponsiveText } from "../utils/ResponsiveText"
import { useFormikContext } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import { warning } from "framer-motion"
import FormToggle from "./utils/FormToggle"
import { FormikSignatureField } from "./utils/SignatureField"
import { RemoveButton } from "./utils/ItemButtons"
import { useLoan } from "../../context/LoanProvider"
import { LoanType } from "./Loan"

export const LoanUser = function({ fieldArrayName, userIndex, userHelpers }) {

    const [ curUserOption, setCurUserOption ] = useState({})
    const { handleUserSearch } = useFormModal()
    const { mode, setMode, loan } = useLoan()

    // console.log('loan user');

    // useEffect(() => console.log(curUserOption), [curUserOption]);

    return (
        <>
            <SearchSingleSelectFormControl
                name={`${fieldArrayName}.${userIndex}.userId`}
                searchFn={handleUserSearch}
                callback={(newOption) => {
                    if (!newOption || !curUserOption || newOption.value === curUserOption.value) return;
                    setCurUserOption(newOption);
                }}
                label={mode === LoanType.SHARED ? `User #${userIndex + 1}` : 'User'}
                placeholder="Select user"
            >
                <RemoveButton
                    ariaLabel="Remove User"
                    onClick={() => {
                        if (loan.users.length === 2) setMode(null);
                        userHelpers.remove(userIndex);
                    }}
                    isDisabled={loan.users.length === 1}
                />
            </SearchSingleSelectFormControl>
            {curUserOption && curUserOption.label && (
            <FormikSignatureField
                name={`${fieldArrayName}.${userIndex}.signature`}
                label={`Signature`}
            />)}
        </>
    )
}