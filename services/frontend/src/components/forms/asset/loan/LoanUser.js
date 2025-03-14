import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../../utils/ResponsiveText"
import React, { useEffect, useState } from "react"
import { AddButton, RemoveButton } from "../../utils/ItemButtons"
import { useLoan } from "./LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { LoanItems } from "./LoanItems";
import { SearchMultiSelectFormControl, SearchSingleSelectFormControl } from "../../utils/SelectFormControl"
import { useFormModal } from "../../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../../utils/DateInputControl"
import { useLoans } from "./LoansProvider"
import userService from "../../../../services/UserService"
import loanService from "../../../../services/LoanService"

export const createNewAccessory = (accessory=null) => ({
	'key': uuidv4(),
	'accessoryTypeId': accessory?.accessoryTypeId || '',
	'accessoryName': accessory?.accessoryName || '',
	'count': accessory?.count || 1,
})

export const createNewAsset = (asset) => ({ // 1 loan only can have 1 asset
	'key': uuidv4(),
	'assetId': asset?.assetId || '',
	'alias': asset?.alias || '',
	'accessories': asset?.accessories?.map(accessory => createNewAccessory(accessory)) || [createNewAccessory()],
	'serialNumber': asset?.serialNumber || '',
	'onLoan': asset?.astLoans?.length > 0 ? true : false,
})

export const createNewLoan = ({
	asset={},
	accessories=[],
	expectedReturnDate=null, 
	remarks=null
} = {}) => ({
	'key': uuidv4(),
	'excludeAsset': false,
	'asset': createNewAsset(asset),
	'accessories': accessories.length > 0 ? accessories.map(acc => createNewAccessory(acc)) : [],
	'expectedReturnDate': expectedReturnDate || '',
	'remarks': remarks || '',
})

export const createNewUser = (
	user={}
) => ({
	'key': uuidv4(),
	'userId': user.userId || user.userId || '',
	'userName': user.userName || '',
	'loans': user.loans?.length > 0 ? user.loans.map(loan => createNewLoan(loan)) : [createNewLoan()],
	'signature': ""
})

export const LoanUser = () => {

	const { user, userIndex } = useLoan();
	const { userOptions } = useLoans();
	const { setFieldValue } = useFormikContext();

	const updateUserFields = (userIndex, selected) => {
		if (!selected?.value) {
			setFieldValue(`users.${userIndex}.userId`, '');
            setFieldValue(`users.${userIndex}.userName`, '');
            return;
		}
		setFieldValue(`users.${userIndex}.userId`, selected.userId || "");
	}

	return (
		<Box position='relative'>
			<Flex direction="column" key={user.key} gap={2}>
				<Flex justifyContent="space-between" gap={2} alignItems="center">
					<ResponsiveText size="md" fontWeight="bold" align="center" display="block">
						{`User #${userIndex + 1}`}
					</ResponsiveText>
					<SearchSingleSelectFormControl
						name={`users.${userIndex}.userName`}
						searchFn={loanService.fetchUserLoan}
						placeholder="Select user"
						updateFields={(selected) => updateUserFields(userIndex, selected)}
						initialOptions={userOptions}
					/>
				</Flex>
				
				
				<FieldArray name={`users.${userIndex}.loans`}>
					{loanHelpers => (
						user.loans.map((loan, loanIndex, loanArray) => (
							<LoanItems
								key={loan.key}
								field={`users.${userIndex}.loans.${loanIndex}`}
								loan={loan}
							>
								{/* children are the helper functions */}
								<Flex mt={2} gap={4} justifyContent="space-between">
									{loanArray.length > 1 && (
										<Button
											type="button"
											onClick={() => loanHelpers.remove(loanIndex)}
											alignSelf="flex-start"
											colorScheme="red"
										>
										<ResponsiveText>{`Remove loan for ${user.userName ? user.userName : `User #${userIndex+1}`}`}</ResponsiveText>
										</Button>
									)}
								</Flex>
								<Divider borderColor="black" borderWidth="0.5px" my={4} />
								{loanIndex === loanArray.length - 1 && (
									<AddButton
										alignSelf="flex-start"
										handleClick={() => loanHelpers.push(createNewLoan())}
										label={`Add loan for ${loan.userName ? `${loan.userName}` : `User #${userIndex+1}`}`}
									/>
								)}
							</LoanItems>
						))
					)}
				</FieldArray>
			</Flex>
		</Box>
	);
}
