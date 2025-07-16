import { Box, Button, Flex, ListItem, ModalBody, ModalFooter, UnorderedList, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { FormikSignatureField } from "../utils/SignatureField";
import { FieldArray, Form, Formik } from "formik";
import { useLayoutEffect, useRef, useState } from "react";
import { useReturns } from "./ReturnsProvider";

export const ReturnStep2 = () => {

  const { formData, handleSubmit, prevStep } = useReturns();

	return (
		<Formik
			initialValues={formData}
			onSubmit={handleSubmit}
			validateOnChange={true}
			enableReinitialize={true}
			// validateOnBlur={true}
		>
			<Form>
				<ModalBody>
				{formData.returns.map((_return) => (
					<Flex 
						key={_return.loanId}
						direction="column"
						border="1px solid"
						borderColor="gray.300"
						borderRadius="md"
						p={4}
						mb={4}
						boxShadow="sm"
					>
						{/* Display Asset Information */}
						{_return.asset.count > 0 && <ResponsiveText size="lg" fontWeight="bold">
						Serial Number: {_return.asset.serialNumber}
						</ResponsiveText>}

						{/* Display Users Associated with This Asset */}
						<ResponsiveText key={_return.userId}>{_return.userName}</ResponsiveText>

						{/* Display Accessories Associated with This Asset */}
						{_return.accessoryTypes.length > 0 && (
						<Box mt={2}>
							<ResponsiveText fontWeight="bold">Accessories Returned:</ResponsiveText>
							<UnorderedList>
							{_return.accessoryTypes.map(accessoryType => (
								<ListItem key={accessoryType.accessoryTypeId}>
								{accessoryType.accessoryName} - {accessoryType.count}/{accessoryType.unreturned} returned
								</ListItem>
							))}
							</UnorderedList>
						</Box>
						)}
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