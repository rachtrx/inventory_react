import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../utils/ResponsiveText"
import React, { useEffect } from "react"
import { LoanSummary } from "./utils/LoanSummary"
import { AddButton } from "./utils/ItemButtons"
import { useLoan } from "../../context/LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { LoanAsset } from "./LoanAsset";
import { LoanUser } from "./LoanUser";
import { v4 as uuidv4 } from 'uuid';

export const LoanType = Object.freeze({
	SINGLE: 'SINGLE',
	SHARED: 'SHARED',
});

const createNewAsset = (assetId='') => ({
    'key': uuidv4(),
      'assetId': assetId,
	  'assetTag': '',
      'remarks': '',
      'peripherals': []
})
  
const createNewUser = (userId='') => ({
    'key': uuidv4(),
    'userId': userId,
	'userName': '',
    'signature': '',
})
  
export const createNewLoan = (assetId='', userId='', saved=false) => ({
    'key': uuidv4(),
    'users': [createNewUser(userId)],
    'assets': [createNewAsset(assetId)],
    'saved': saved,
})

export const Loan = () => {

	const { mode, setMode, loan, loanIndex } = useLoan();

	useEffect(() => {
		const allEmptyAssets = loan.assets.every(asset => asset.assetId === '');
		console.log();
		if (allEmptyAssets && loan.users.length < 2) setMode(null);
	}, [loan, setMode])

	return (
		<Box position='relative'>
			<Flex direction="column" key={loan.key}>
				<Box display={loan.saved ? "none" : "block"}>
					<FieldArray name={`loans.${loanIndex}.assets`}>
						{assetHelpers => loan.assets.map((asset, assetIndex, array) => (
							<Flex direction="column" key={asset.key}>
								<LoanAsset
									fieldArrayName={`loans.${loanIndex}.assets`}
									assetIndex={assetIndex}
									assets={loan.assets}
									assetHelpers={assetHelpers}
								/>
								<Flex justifyContent="flex-start" mt={2} mb={4}>
									{assetIndex === array.length - 1 && (
										<AddButton
											handleClick={() => assetHelpers.push(createNewAsset())}
											label={'Add Asset'}
										/>
									)}
								</Flex>
							</Flex>
						))}
					</FieldArray>
					<FieldArray name={`loans.${loanIndex}.users`}>
						{ userHelpers => loan.users.map((user, userIndex, array) => (
							<VStack key={user.key}>
								<LoanUser
									fieldArrayName={`loans.${loanIndex}.users`}
									userIndex={userIndex}
									userHelpers={userHelpers}
									users={loan.users}
								/>
								<Flex alignSelf={'flex-start'} justifyContent={'space-between'} gap={4}>
									{userIndex === array.length - 1 && mode !== LoanType.SINGLE &&
									(
										<AddButton
											handleClick={() => {
												userHelpers.push(createNewUser());
												setMode(LoanType.SHARED);
											}}
											label={'Add User'}
										/>
									)}
								</Flex>
							</VStack>
						))}
					</FieldArray>
				</Box>
			</Flex>
		</Box>
	);
}