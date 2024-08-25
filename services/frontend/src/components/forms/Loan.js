import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { v4 as uuidv4 } from 'uuid';
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../utils/ResponsiveText"
import React, { useEffect } from "react"
import { LoanSummary } from "./utils/LoanSummary"
import { AddButton } from "./utils/ItemButtons"
import { useLoan } from "../../context/LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { LoanAsset } from "./LoanAsset";
import { LoanUser } from "./LoanUser";

export const LoanType = Object.freeze({
	SINGLE: 'SINGLE',
	SHARED: 'SHARED',
});

const createNewAsset = (assetId='') => ({
	'key': uuidv4(),
    'assetId': assetId,
    'remarks': '',
    'peripherals': []
})

const createNewUser = (userId='') => ({
	'key': uuidv4(),
	'userId': userId,
	'signature': '',
})

export const createNewLoan = (saved=false, assetId='', userId='') => ({
	'key': uuidv4(),
	'users': [createNewUser(userId)],
	'assets': [createNewAsset(assetId)],
	'saved': saved,
})

const LoanMode = ({ mode }) => {
  return (
    <Flex direction="row" alignItems="center" position='absolute' right='1'>
      <Flex
        p={1}
        gap={1}
        borderRadius="md"
        bg="teal.500"
        color="white"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box as="span" fontSize="xs">
          {mode === LoanType.SHARED ? <FaUsers size="10px" /> : <FaUser size="10px" />}
        </Box>
        <ResponsiveText fontSize="xs">{mode} MODE</ResponsiveText>
      </Flex>
    </Flex>
  );
};


export const Loan = () => {

	const { values, setFieldValue } = useFormikContext();
	const { mode, setMode, loan, loanIndex, loanHelpers, errors, loanCount } = useLoan();

	console.log(mode);

	useEffect(() => {
		const allEmptyAssets = loan.assets.every(asset => asset.assetId === '');
		console.log();
		if (allEmptyAssets && loan.users.length < 2) setMode(null);
	}, [loan, setMode])

	return (
		<Box position='relative'>
			{mode && <LoanMode mode={mode}/>}
			<ResponsiveText size="md" fontWeight="bold" align="center">
				{`Loan #${loanIndex + 1}`}
			</ResponsiveText>
			{loan.saved ? (
				<LoanSummary
					loan={loan}
					handleEdit={() => {
					setFieldValue(`loans.${loanIndex}.saved`, false);
					console.log(values);
					}}
					handleRemove={() => {
					loanHelpers.remove(loanIndex);
					console.log(values);
					}}
					isOnlyLoan={values.loans.length === 1}
				/>
			) : (
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
					<Flex mt={2} gap={4} justifyContent="space-between">
					{values.loans.length > 1 && !loan.saved && (
						<Button
						type="button"
						onClick={() => loanHelpers.remove(loanIndex)}
						alignSelf="flex-start"
						colorScheme="red"
						>
						<ResponsiveText>Remove</ResponsiveText>
						</Button>
					)}
					{loanIndex === loanCount - 1 && (
						<AddButton
						handleClick={() => loanHelpers.push(createNewLoan())}
						label="Add Loan"
						/>
					)}
					{!loan.saved && (
						<>
						<Spacer />
						<Button
							onClick={() => setFieldValue(`loans.${loanIndex}.saved`, true)}
							colorScheme="green"
							isDisabled={errors}
							alignSelf="flex-end"
						>
							Save
						</Button>
						</>
					)}
					</Flex>
					<Divider borderColor="black" borderWidth="2px" my={4} />
				</Flex>
			)}
		</Box>
	);
}