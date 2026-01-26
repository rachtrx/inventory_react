import { Box, Button, Flex, ListItem, ModalBody, ModalFooter, Text, UnorderedList } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useReturns } from "./ReturnsProvider";
import { useStep } from "../../../context/StepProvider";

export const ReturnStep2 = () => {

  const { handleSubmit } = useReturns();
  const { formData, prevStep } = useStep();

	return formData?.returns ? (
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
						{_return.asset.count > 0 && <Text fontSize="lg" fontWeight="bold">
							Serial Number: {_return.asset.serialNumber}
						</Text>}

						{/* Display Users Associated with This Asset */}
						<Text key={_return.userId}>{_return.userName}</Text>

						{/* Display Accessories Associated with This Asset */}
						{_return.accessoryTypes.length > 0 && (
						<Box mt={2}>
							<Text fontWeight="bold">Accessories Returned:</Text>
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
	) : undefined;
}