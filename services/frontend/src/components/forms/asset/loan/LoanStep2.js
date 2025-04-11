import { Box, Button, Flex, List, ModalBody, ModalFooter, Text, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import { FormikSignatureField } from "../../utils/SignatureField";
import { FieldArray, Form, Formik } from "formik";
import { useLayoutEffect, useRef, useState } from "react";
import { useLoans } from "./LoansProvider";

export const LoanStep2 = () => {

	const {prevStep, handleSubmit, formData} = useLoans()
	const parentRef = useRef(null);
    const [signatureFieldWidth, setSignatureFieldWidth] = useState('auto');

	console.log(formData);

	const updateSignatureFieldWidth = () => {
    if (parentRef.current) {
      const parentWidth = parentRef.current.offsetWidth; // Get total parent width
      setSignatureFieldWidth(parentWidth - 95);
    }
  };

	useLayoutEffect(() => {
		updateSignatureFieldWidth();
	
		window.addEventListener('resize', updateSignatureFieldWidth);
	
		return () => {
			window.removeEventListener('resize', updateSignatureFieldWidth);
		};
	}, []);

	return (
		<Formik
			initialValues={formData}
			onSubmit={handleSubmit}
			validateOnChange={true}
			enableReinitialize={true}
			// validateOnBlur={true}
		>
			<Form>
				<ModalBody ref={parentRef}>
					{formData.users.map((user, userIndex) => (
						<Flex 
							key={user.userId} 
							direction="column" 
							border="1px solid"
							borderColor="gray.300"
							borderRadius="md"
							p={4}
							mb={4}
							boxShadow="sm"
						>
							<ResponsiveText size='lg'>{user.userName}</ResponsiveText>
							<ResponsiveText>
							{user.loans.map((loan, index) => (
								<Text as="span" key={index}> {/* ✅ Fix: Use Text instead of Box */}
								{loan.asset && loan.asset.serialNumber && `${loan.asset.serialNumber}`}
								{loan.asset && loan.asset.serialNumber && loan.accessories && loan.accessories.length > 0 && ` | `}
								{loan.accessories && loan.accessories.length > 0 &&
									`${loan.accessories.map(accessory => `${accessory.accessoryName} x${accessory.count}`).join(", ")}`}
								{loan.expectedReturnDate && ` | Due on: ${loan.expectedReturnDate}`}
								</Text>
							))}
							</ResponsiveText>

							<FormikSignatureField
								name={`users.${userIndex}.signature`}
								label='Signature'
								signatureFieldWidth={signatureFieldWidth}
							/>
						</Flex>
					))}
				</ModalBody>
			
				<ModalFooter>
					<Button onClick={prevStep}>Back</Button>
					<Button colorScheme="blue" type="submit">Submit</Button>
				</ModalFooter>
			</Form>
		</Formik>
	);
}