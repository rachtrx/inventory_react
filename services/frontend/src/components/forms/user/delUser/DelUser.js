import { useEffect, useState } from "react"
import InputFormControl from "../../utils/InputFormControl"
import { useFormikContext } from 'formik';
import { CreatableSingleSelectFormControl, SearchSingleSelectFormControl } from "../../utils/SelectFormControl";
import { useDelUsers } from "./DelUsersProvider";
import { Flex } from "@chakra-ui/react";
import DateInputControl from "../../utils/DateInputControl";
import { useFormModal } from "../../../../context/ModalProvider";
import userService from "../../../../services/UserService";

export const DelUser = function({ field, user, children }) {

	const { userOptions } = useDelUsers();
	const { values, setFieldValue } = useFormikContext();

	const updateUserFields = async (selected) => {
		// console.log(selected?.userId);
        if (!selected || selected.userId) { // IMPT dont update for new created types
            setFieldValue(`${field}.userId`, selected?.userId || '');
            setFieldValue(`${field}.lastEventDate`, selected?.lastEventDate || '');
        }
    };

	// useEffect(() => {
	// 	console.log(values);
	// }, [values])

	return (
		<Flex direction="column" gap={2}>
			<SearchSingleSelectFormControl
				name={`${field}.userName`}
				searchFn={value => userService.fetchUserDel(value)}
				updateFields={(selected) => updateUserFields(selected)}
				label={`User Name`}
				placeholder="User Name"
				initialOptions={userOptions}
			/>
			<DateInputControl label="Delete Date" name={`${field}.delDate`} />
			<InputFormControl label={`Remarks for user`} name={`${field}.remarks`}/>
			{children}
		</Flex>
	)
}