import { Box, Button, Flex, ListItem, ModalBody, ModalFooter, Table, Tbody, Td, Th, Thead, Tr, UnorderedList, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../../../utils/ResponsiveText";
import { FormikSignatureField } from "../../../utils/SignatureField";
import { FieldArray, Form, Formik } from "formik";
import { useUserTags } from "../UserTagsProvider";

export const DelUserTagsStep2 = () => {

  const { formData, handleDelTagsSubmit, prevStep } = useUserTags();

	return (
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
						<ResponsiveText size="lg" fontWeight="bold">
							Tag: {tag.tagName}
						</ResponsiveText>

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
	);
}