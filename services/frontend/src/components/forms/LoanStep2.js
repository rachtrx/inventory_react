import { Box, Button, Flex } from "@chakra-ui/react";
import { ResponsiveText } from "../utils/ResponsiveText";
import { FormikSignatureField } from "./utils/SignatureField";
import { FieldArray, Form, Formik } from "formik";

export const LoanStep2 = ({ prevStep, handleSubmit, userLoans, formData }) => {

	return (
		<Formik
			initialValues={formData}
			onSubmit={handleSubmit}
			validateOnChange={true}
			// validateOnBlur={true}
			// enableReinitialize={true}
		>
			<Form>
				<FieldArray name="loans.signatures">
					{() => (
						<Box position="relative">
							{Object.entries(userLoans).map(([userId, userLoan], userIndex) => (
								<Flex key={userId}>
									{userLoan.assets.map((assetLoan) => (
										<ResponsiveText key={assetLoan.assetTag}>
											{assetLoan.assetTag} {assetLoan.peripherals?.join(', ')} {assetLoan.expectedReturnDate}
										</ResponsiveText>
									))}
									<FormikSignatureField
										name={`loans.signatures.${userId}`}
										label={`Signature for ${userLoan.userName || 'User'}`}
									/>
								</Flex>
							))}
						</Box>
					)}
				</FieldArray>
			<Button onClick={prevStep}>Back</Button>
			</Form>
		</Formik>
	);
}