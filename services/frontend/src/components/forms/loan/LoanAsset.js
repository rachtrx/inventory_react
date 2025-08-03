import { CreatableSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormikContext } from 'formik';
import { useLoans } from "./LoansProvider"
import { AvailAstSelectFormControl } from "../options/AvailAssetOptions"
import loanService from "../../../services/LoanService"
import { Flex } from "@chakra-ui/react";
import { useRef } from "react";

export const LoanAsset = function({ field, asset }) {
    
    const { setFieldValue } = useFormikContext();
    const { assetOptions, locationOptions, setLocationOptions } = useLoans();

    const updateAssetFields = (selected) => {

        if (!selected?.value) {
			setFieldValue(`${field}.assetId`, '');
            setFieldValue(`${field}.onLoan`, false);
            return;
		}
        console.log(selected);
        console.log(`${field}.assetId`);
        setFieldValue(`${field}.assetId`, selected?.assetId || '');
        setFieldValue(`${field}.onLoan`, selected?.loan ? true : false);
    }

    return (
        <Flex direction="column" gap={1}>
            <AvailAstSelectFormControl
                name={`${field}.serialNumber`}
                options={assetOptions}
                searchFn={value => loanService.fetchAstLoan(value)}
                handleClick={updateAssetFields}
                label={`Serial Number`}
                placeholder="Serial Number"
            />
            <CreatableSingleSelectFormControl
                name={`${field}.location`}
                label={`Location`}
                placeholder="Select Location"
                options={locationOptions}
                setOptions={setLocationOptions}
            /> 
        </Flex>
    )
}