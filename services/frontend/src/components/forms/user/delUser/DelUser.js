import { useFormikContext } from 'formik';
import { SearchSingleSelectFormControl } from "../../utils/SelectFormControl";
import { useDelUsers } from "./DelUsersProvider";
import { Flex } from "@chakra-ui/react";
import DateInputControl from "../../utils/DateInputControl";
import userService from "../../../../services/UserService";
import RemarksFormControl from "../../utils/RemarksFormControl";

export const DelUser = function({ field, user, children }) {

	const { userOptions } = useDelUsers();
	const { setFieldValue } = useFormikContext();

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
			<RemarksFormControl label={`Remarks for user`} name={`${field}.remarks`}/>
			{children}
		</Flex>
	)
}