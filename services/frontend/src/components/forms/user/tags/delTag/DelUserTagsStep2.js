import { Box, Button, Flex, ModalBody, ModalFooter, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useUserTags } from "../UserTagsProvider";
import { useStep } from "../../../../../context/StepProvider";

export const DelUserTagsStep2 = () => {

  const { handleDelTagsSubmit } = useUserTags();
  const { formData, prevStep } = useStep();

	return formData?.tags ? (
		<Formik
			initialValues={formData}
			onSubmit={handleDelTagsSubmit}
			validateOnChange={true}
			enableReinitialize={true}
			// validateOnBlur={true}
		>
			<Form>
				<ModalBody>
					{formData.tags.map((tag, tagIndex) => (
						<Flex
						key={tag.key || tagIndex}
						direction="column"
						border="1px solid"
						borderColor="gray.300"
						borderRadius="md"
						p={4}
						mb={4}
						boxShadow="sm"
						>
						<Text fontSize="lg" fontWeight="bold">
							Tag: {tag.tagName}
						</Text>

						{tag.users.length > 0 && (
							<Box overflowX="auto" w="100%" mt={2}>
							<Table size="sm" variant="striped" minW="500px">
								<Thead>
								<Tr>
									<Th>User Name</Th>
									<Th>Remarks</Th>
								</Tr>
								</Thead>
								<Tbody>
								{tag.users.map((user, userIndex) => (
									<Tr key={user.key || userIndex}>
									<Td>{user.userName}</Td>
									<Td>{user.remarks || "-"}</Td>
									</Tr>
								))}
								</Tbody>
							</Table>
							</Box>
						)}
						</Flex>
					))}
				</ModalBody>

				<ModalFooter>
					<Button onClick={prevStep}>Back</Button>
					<Button colorScheme="red" type="submit">
						Confirm Untagging
					</Button>
				</ModalFooter>
			</Form>
		</Formik>
	) : undefined;
}