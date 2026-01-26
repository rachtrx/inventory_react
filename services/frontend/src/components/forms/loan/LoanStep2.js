import { Box, Button, Flex, ModalBody, ModalFooter, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { FormikSignatureField } from "../utils/SignatureField";
import { Form, Formik } from "formik";
import { useLayoutEffect, useRef, useState } from "react";
import { useLoans } from "./LoansProvider";
import { useStep } from "../../../context/StepProvider";

export const LoanStep2 = () => {

	const {handleSubmit} = useLoans();
	const { prevStep, formData } = useStep();
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

	return formData?.users ? (
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
							<Text fontSize='lg' fontWeight="bold">
								{user.userName}
							</Text>

							{user.loans.length > 0 && (
								<Box overflowX="auto" w="100%" mt={2}>
								<Table size="sm" variant="striped" minW="650px">
									<Thead>
									<Tr>
										<Th>Serial Number</Th>
										<Th>Accessories</Th>
										<Th>Expected Return</Th>
									</Tr>
									</Thead>
									<Tbody>
									{user.loans.map((loan, index) => (
										<Tr key={index}>
										<Td>{loan.asset?.serialNumber || '-'}</Td>
										<Td>
											{loan.accessories && loan.accessories.length > 0
											? loan.accessories.map(acc => `${acc.accessoryName} x${acc.count}`).join(', ')
											: '-'}
										</Td>
										<Td>
											{loan.expectedReturnDate
											? new Date(loan.expectedReturnDate).toLocaleDateString()
											: '-'}
										</Td>
										</Tr>
									))}
									</Tbody>
								</Table>
								</Box>
							)}

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
	) : undefined;
}