import { useEffect } from "react"
import { CreatableSingleSelectFormControl } from "../utils/SelectFormControl"
import { useUI } from "../../../context/UIProvider"
import accessoryService from "../../../services/AccessoryService"
import { useFormikContext } from 'formik';
import { useLoans } from "./LoansProvider"
import { AvailAstSelectFormControl } from "../options/AvailAssetOptions"
import loanService from "../../../services/LoanService"

export const LoanAsset = function({ field, asset }) {
    
    const { setFieldValue } = useFormikContext();
    const { assetOptions, locationOptions } = useLoans();

    const updateAssetFields = (selected) => {
        console.log(selected);
        console.log(`${field}.assetId`);
        setFieldValue(`${field}.assetId`, selected?.assetId || '');
        setFieldValue(`${field}.onLoan`, selected?.loan ? true : false);
    }

    return (
        <>
            <AvailAstSelectFormControl
                name={`${field}.serialNumber`}
                searchFn={value => loanService.fetchAstLoan(value)}
                updateFields={updateAssetFields}
                label={`Serial Number`}
                placeholder="Serial Number"
                initialOptions={assetOptions}
            />
            <CreatableSingleSelectFormControl
                name={`${field}.location`}
                label={`Location`}
                placeholder="Select Location"
                initialOptions={locationOptions}
            /> 
        </>
    )
}