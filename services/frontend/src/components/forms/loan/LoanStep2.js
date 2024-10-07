import { Box, Button, Flex, ModalBody, ModalFooter, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { FormikSignatureField } from "../utils/SignatureField";
import { FieldArray, Form, Formik } from "formik";
import { useLayoutEffect, useRef, useState } from "react";
import { useLoans } from "../../../context/LoansProvider";

export const LoanStep2 = () => {

	const {prevStep, handleSubmit, userLoans, formData} = useLoans()
	const parentRef = useRef(null);
    const [signatureFieldWidth, setSignatureFieldWidth] = useState('auto');

	console.log(userLoans);

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
			// validateOnBlur={true}
			// enableReinitialize={true}
		>
			<Form>
				<ModalBody ref={parentRef}>
						{Object.entries(userLoans).map(([userId, userLoan]) => (
							<Flex 
								key={userId} 
								direction="column" 
								border="1px solid"
								borderColor="gray.300"
								borderRadius="md"
								p={4}
								mb={4}
								boxShadow="sm"
							>
								<ResponsiveText size='lg'>{userLoan.userName}</ResponsiveText>
								{userLoan.assets.map((assetLoan) => (
									<ResponsiveText key={assetLoan.assetTag}>
										{assetLoan.assetTag} ({assetLoan.peripherals.map(peripheral => `${peripheral.peripheralName} x${peripheral.count}`).join(', ')}) {assetLoan.expectedReturnDate && `Due on ${assetLoan.expectedReturnDate}`}
									</ResponsiveText>
								))}
								<FormikSignatureField
									name={`signatures.${userId}`}
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