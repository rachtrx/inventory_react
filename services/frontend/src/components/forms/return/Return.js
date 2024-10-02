import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { useLoan } from "../../../context/LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../utils/DateInputControl"

const createNewPeripheral = (peripheral) => ({
    'key': uuidv4(),
    'id': peripheral.peripheralId || '',
    'peripheralName': peripheral.peripheralName || '',
    'disabled': peripheral.returned,
    'selected': peripheral.selected
})

const createNewUser = (user) => ({
	'key': uuidv4(),
	'userId': user.userId || '',
	'userName': user.userName || '',
    'peripherals': user.peripherals ? user.peripherals.map(peripheral => createNewPeripheral(peripheral)) : []
})

export const createNewReturn = (assetTag='') => ({
	'key': uuidv4(),
	'assetId': assetTag,
	'assetTag': assetTag,
	'users': [],
	'remarks': ''
})

export const Return = () => {

	const { mode, loan, loanIndex } = useLoan();
	const { handleUserSearch } = useFormModal();

	return (
		<Box position='relative'>
			<Flex direction="column" key={loan.key}>
				<LoanAsset
					loanIndex={loanIndex}
					asset={loan.asset}
				/>
				<FieldArray name={`loans.${loanIndex}.users`}>
					{ userHelpers => loan.users.map((user, userIndex, array) => (
						<VStack key={user.key}>
							<SearchSingleSelectFormControl
								name={`loans.${loanIndex}.users.${userIndex}.userId`}
								searchFn={handleUserSearch}
								secondaryFieldsMeta={[
									{name: `loans.${loanIndex}.users.${userIndex}.userName`, attr: 'userName'},
								]}
								label={mode === LoanType.SHARED ? `User #${userIndex + 1}` : 'User'}
								placeholder="Select user"
							>
								<RemoveButton
									ariaLabel="Remove User"
									onClick={() => {
										userHelpers.remove(userIndex);
									}}
									isDisabled={loan.users.length === 1}
								/>
							</SearchSingleSelectFormControl>
							
							<Flex alignSelf={'flex-start'} justifyContent={'space-between'} gap={4}>
								{userIndex === array.length - 1 && mode !== LoanType.SINGLE &&
								(
									<AddButton
										handleClick={() => {
											userHelpers.push(createNewUser());
										}}
										label={'Add User'}
									/>
								)}
							</Flex>
						</VStack>
					))}
				</FieldArray>
				<Flex mt={2}>
					<DateInputControl label="Loaned Date" name={`loans.${loanIndex}.loanDate`} />
					<DateInputControl label="Expected Return Date" name={`loans.${loanIndex}.expectedReturnDate`} />
				</Flex>
			</Flex>
		</Box>
	);
}