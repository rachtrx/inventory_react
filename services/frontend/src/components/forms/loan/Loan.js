import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { useLoan } from "../../../context/LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { LoanAsset } from "./LoanAsset";
import { SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../utils/DateInputControl"
import { useLoans } from "../../../context/LoansProvider"

export const LoanType = Object.freeze({
	SINGLE: 'SINGLE',
	SHARED: 'SHARED',
});

export const createNewPeripheral = (peripheral=null) => ({
	'key': uuidv4(),
	'id': peripheral?.peripheralId || peripheral?.id || '',
	'peripheralName': peripheral?.peripheralName || '',
	'count': peripheral?.count || 1, 
})

const createNewAsset = (asset, peripherals=[]) => ({ // 1 loan only can have 1 asset
	'key': uuidv4(),
	'assetId': asset?.assetId || asset?.id || '',
	'assetTag': asset?.assetTag || '',
	'peripherals': peripherals.map(peripheral => createNewPeripheral(peripheral, peripheral.count)) || [], // Peripherals grouped with Asset due to AssetLoan.js, peripherals are tagged to the asset
	'remarks': '',
	'shared': false
})
  
const createNewUser = (user=null) => ({
	'key': uuidv4(),
	'userId': user?.userId || user?.id || '',
	'userName': user?.userName || '',
	'signature': '',
})


export const createNewLoan = (asset=null, users=[], peripherals=[], loanDate=null, expectedReturnDate='') => ({
	'key': uuidv4(),
	'asset': createNewAsset(asset, peripherals),
	'users': users.length === 0 ? [createNewUser()] : users.map(user => createNewUser(user)),
	'mode': '',
	'loanDate': loanDate || new Date(),
	'expectedReturnDate': expectedReturnDate,
})

export const Loan = () => {

	const { mode, loan, loanIndex } = useLoan();
	const { userOptions } = useLoans();
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
								initialOptions={userOptions}
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
