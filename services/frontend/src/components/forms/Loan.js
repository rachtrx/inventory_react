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

const createNewAsset = (assetTag='', peripherals=[]) => ({
	'key': uuidv4(),
	'assetId': assetTag,
	'assetTag': assetTag,
	'remarks': '',
	'peripherals': peripherals,
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
	'users': userNames.length === 0 ? [createNewUser()] : userNames.map(userName => createNewUser(userName)),
	'assets': [createNewAsset(assetTag, peripherals)],
	'mode': ''
})

export const Loan = () => {

	const { mode, loan, loanIndex, saved } = useLoan();

	return (
		<Box position='relative'>
			<Flex direction="column" key={loan.key}>
				<Box display={saved ? "none" : "block"}>
					<FieldArray name={`loans.${loanIndex}.assets`}>
						{assetHelpers => loan.assets.map((asset, assetIndex, array) => (
							<Flex direction="column" key={asset.key}>
								<LoanAsset
									fieldArrayName={`loans.${loanIndex}.assets`}
									assetIndex={assetIndex}
									asset={asset}
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
									user={user}
									userHelpers={userHelpers}
								/>
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
				</Box>
			</Flex>
		</Box>
	);
}