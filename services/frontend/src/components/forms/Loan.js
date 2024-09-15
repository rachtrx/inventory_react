import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../utils/ResponsiveText"
import React, { useEffect } from "react"
import { LoanSummary } from "./utils/LoanSummary"
import { AddButton, RemoveButton } from "./utils/ItemButtons"
import { useLoan } from "../../context/LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { createNewPeripheral, LoanAsset } from "./LoanAsset";
import { SearchSingleSelectFormControl } from "./utils/SelectFormControl"
import { useFormModal } from "../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';

export const LoanType = Object.freeze({
	SINGLE: 'SINGLE',
	SHARED: 'SHARED',
});

const createNewAsset = (assetTag='', peripherals=[]) => ({
	'assetId': assetTag,
	'assetTag': assetTag,
	'peripherals': peripherals.length === 0 ? [] : peripherals.map(peripheral => createNewPeripheral(peripheral)),
	'remarks': '',
	'shared': false
})
  
const createNewUser = (userName='') => ({
	'key': uuidv4(),
	'userId': userName,
	'userName': userName,
	'signature': '',
})
  
export const createNewLoan = (assetTag='', userNames=[], peripherals=[]) => ({
	'key': uuidv4(),
	'asset': createNewAsset(assetTag, peripherals),
	'users': userNames.length === 0 ? [createNewUser()] : userNames.map(userName => createNewUser(userName)),
	'mode': '',
	'loanDate': new Date(),
	'expectedReturnDate': null,
})

export const Loan = () => {

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
			</Flex>
		</Box>
	);
}