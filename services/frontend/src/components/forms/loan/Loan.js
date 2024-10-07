import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { useLoan } from "../../../context/LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { createNewPeripheral, LoanAsset } from "./LoanAsset";
import { SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../utils/DateInputControl"

export const LoanType = Object.freeze({
	SINGLE: 'SINGLE',
	SHARED: 'SHARED',
});

const createNewAsset = (assetTag='', peripherals) => ({ // 1 loan only can have 1 asset
	'key': uuidv4(),
	'assetId': assetTag,
	'assetTag': assetTag,
	'peripherals': peripherals.map(peripheral => createNewPeripheral(peripheral.peripheralName, peripheral.count)) || [], // Peripherals grouped with Asset due to AssetLoan.js, peripherals are tagged to the asset
	'remarks': '',
	'shared': false
})
  
const createNewUser = (userName='') => ({
	'key': uuidv4(),
	'userId': userName,
	'userName': userName,
	'signature': '',
})


export const createNewLoan = (assetTag='', userNames=[], peripherals=[], loanDate=null, expectedReturnDate='') => ({
	'key': uuidv4(),
	'asset': createNewAsset(assetTag, peripherals),
	'users': userNames.length === 0 ? [createNewUser()] : userNames.map(userName => createNewUser(userName)),
	'mode': '',
	'loanDate': loanDate || new Date(),
	'expectedReturnDate': expectedReturnDate,
})

export const Loan = () => {

	const { mode, loan, loanIndex } = useLoan();
	const { handleUserSearch } = useFormModal();
	const { setFieldValue } = useFormikContext();

	const updateUserFields = (loanIndex, userIndex, selected) => {
		setFieldValue(`loans.${loanIndex}.users.${userIndex}.userName`, selected?.userName || '')
	}

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
								label={mode === LoanType.SHARED ? `User #${userIndex + 1}` : 'User'}
								placeholder="Select user"
								updateFields={(selected) => updateUserFields(loanIndex, userIndex, selected)}
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
