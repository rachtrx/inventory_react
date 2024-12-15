import { useEffect, useState } from "react"
import InputFormControl from "../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../utils/SelectFormControl";
import { useDelUsers } from "./DelUsersProvider";
import { Flex } from "@chakra-ui/react";
import DateInputControl from "../utils/DateInputControl";
import { useFormModal } from "../../../context/ModalProvider";

export const DelUser = function({ field, user, children }) {

	const { handleUserSearch } = useFormModal();
	const { userOptions } = useDelUsers();
	const { setFieldValue } = useFormikContext();

	const updateUserFields = async (selected) => {
        if (!selected || selected.typeId) { // IMPT dont update for new created types
            setFieldValue(`]${field}.userId`, selected?.typeId || '');
            setFieldValue(`]${field}.lastEventDate`, selected?.lastEventDate || '');
        } 
    };

	return (
		<Flex direction="column" gap={2}>
			<SearchSingleSelectFormControl
				name={`${field}.userName`}
				searchFn={value => handleUserSearch(value)}
				updateFields={(selected) => updateUserFields(selected)}
				label={`User Name`}
				placeholder="User Name"
				initialOptions={userOptions}
			/>
			<DateInputControl label="Delete Date" name={`${field}.delDate`} />
			<InputFormControl label={`Remarks for user`} name={`${field}.remarks`}/>
			{/* Include the helper functions */}
			{children}
		</Flex>
	)
}