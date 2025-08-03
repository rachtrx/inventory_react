import { Box, Button, Divider, Flex, Text } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { AddButton } from "../utils/ItemButtons"
import { useLoan } from "./LoanProvider"
import { LoanItems } from "./LoanItems";
import { SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useLoans } from "./LoansProvider"
import loanService from "../../../services/LoanService"
import { createNewLoan } from "./helpers"
import { useEffect } from "react";

export const LoanUser = () => {

	const { user, userIndex } = useLoan();
	const { userOptions } = useLoans();
	const { values, setFieldValue } = useFormikContext();

	useEffect(() => { console.log(values)}, [values])

	const updateUserFields = (userIndex, selected) => {
		if (!selected?.value) {
			setFieldValue(`users.${userIndex}.userId`, '');
            setFieldValue(`users.${userIndex}.userName`, '');
            return;
		}
		setFieldValue(`users.${userIndex}.userId`, selected?.userId || "");
	}

	return (
		<Box position='relative'>
			<Flex direction="column" key={user.key} gap={2}>
				<Flex justifyContent="space-between" gap={2} alignItems="center">
					<Text fontSize="md" fontWeight="bold" align="center" display="block">
						{`User #${userIndex + 1}`}
					</Text>
					<SearchSingleSelectFormControl
						name={`users.${userIndex}.userName`}
						searchFn={loanService.fetchUserLoan}
						placeholder="Select user"
						handleClick={(selected) => updateUserFields(userIndex, selected)}
						options={userOptions}
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
										<Text>{`Remove loan for ${user.userName ? user.userName : `User #${userIndex+1}`}`}</Text>
										</Button>
									)}
								</Flex>
								<Divider borderColor="black" borderWidth="0.5px" my={4} />
								{loanIndex === loanArray.length - 1 && (
									<AddButton
										alignSelf="flex-start"
										handleClick={() => loanHelpers.push(createNewLoan())}
										label={`Add loan for ${user.userName ? `${user.userName}` : `User #${userIndex+1}`}`}
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
