import { useEffect, useRef } from "react"
import { Flex } from "@chakra-ui/react";
import InputFormControl from "../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { RemoveButton } from "../utils/ItemButtons"
import { useLoans } from "./LoansProvider"
import { AvailAccSelectFormControl } from "../options/AvailAccessoryOptions"

const LoanAccessory = ({ accessory, field, index, helpers, autoFocus }) => {
	
	const { setFieldValue } = useFormikContext();
	const { accessoryOptions, setAccessoryOptions, addNewAccessory } = useLoans();

    const updateAccessoryFields = (selected) => {
		setFieldValue(`${field}.accessoryTypeId`, selected?.accessoryTypeId || '');
	}

    return (
        <Flex direction="column" key={accessory.key}>
            <Flex direction="column" gap={1}>
                <AvailAccSelectFormControl
                    name={`${field}.accessoryName`}
                    handleClick={updateAccessoryFields}
                    options={accessoryOptions}
                    setOptions={setAccessoryOptions}
                    onCreate={addNewAccessory}
                    trueKey="accessoryTypeId"
                    errorAbove={true}
                    autoFocus={autoFocus}
                />
                <Flex gap={1} alignItems="center">
                    <InputFormControl
                        name={`${field}.count`} 
                        type="number" 
                        placeholder="Enter count" 
                    />
                    <RemoveButton
                        ariaLabel="Remove Accessory"
                        handleClick={() => helpers.remove(index)}
                    />
                </Flex>
            </Flex>
            {/* {accessory.accessoryName && !accessory.accessoryTypeId && 
                <WarningCard
                    message={`Create ${accessory.accessoryName}?`}
                    items={accessoryOptions}
                    itemAttr="value"
                    onCreate={async () => await addNewAccessory(accessory.accessoryName)}
                />
            } */}
        </Flex>
    )
}

export default LoanAccessory;