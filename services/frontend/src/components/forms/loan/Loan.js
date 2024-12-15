import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { useLoan } from "./LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { LoanAsset } from "./LoanAsset";
import { SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../utils/DateInputControl"
import { useLoans } from "./LoansProvider"

export const LoanType = Object.freeze({
	SINGLE: 'SINGLE',
	SHARED: 'SHARED',
});

export const createNewAccessory = (accessory=null) => ({
	'key': uuidv4(),
	'accessoryTypeId': accessory?.accessoryTypeId || '',
	'accessoryName': accessory?.accessoryName || '',
	'count': accessory?.count || 1, 
})

const createNewAsset = (asset, accessories=[]) => ({ // 1 loan only can have 1 asset
	'key': uuidv4(),
	'assetId': asset?.assetId || '',
	'assetTag': asset?.assetTag || '',
	'accessories': accessories.map(accessory => createNewAccessory(accessory)) || [], // Accessories grouped with Asset due to AssetLoan.js, accessories are tagged to the asset loan
	'shared': false
})
  
const createNewUser = (user=null) => ({
	'key': uuidv4(),
	'userId': user?.userId || '',
	'userName': user?.userName || '',
	'signature': '',
})


export const createNewLoan = (
	asset=null, 
	users=[], 
	accessories=[], 
	expectedReturnDate=null, 
	remarks=null
) => ({
	'key': uuidv4(),
	'asset': createNewAsset(asset, accessories),
	'users': users.length === 0 ? [createNewUser()] : users.map(user => createNewUser(user)),
	'mode': '',
	'expectedReturnDate': expectedReturnDate || '',
	'remarks': remarks || '',
})

export const Loan = () => {

	const { mode, loan, loanIndex } = useLoan();
	const { userOptions } = useLoans();
	const { handleUserSearch } = useFormModal();
	const { setFieldValue } = useFormikContext();

	const updateUserFields = (loanIndex, userIndex, selected) => {
		setFieldValue(`loans.${loanIndex}.users.${userIndex}.userId`, selected?.userId || '')
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
								name={`loans.${loanIndex}.users.${userIndex}.userName`}
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
					<DateInputControl label="Expected Return Date" name={`loans.${loanIndex}.expectedReturnDate`} />
				</Flex>
			</Flex>
		</Box>
	);
}
