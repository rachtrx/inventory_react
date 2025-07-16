import { Box, Button, Flex, ListItem, ModalBody, ModalFooter, Table, Tbody, Td, Th, Thead, Tr, UnorderedList, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import { FormikSignatureField } from "../../utils/SignatureField";
import { FieldArray, Form, Formik } from "formik";
import { useAddUsers } from "./AddUsersProvider";

export const AddUserStep2 = () => {

  const { formData, handleSubmit, prevStep } = useAddUsers();

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
					{formData.depts.map((dept, deptIndex) => (
						<Flex
						key={dept.key || deptIndex}
						direction="column"
						border="1px solid"
						borderColor="gray.300"
						borderRadius="md"
						p={4}
						mb={4}
						boxShadow="sm"
						>
						<ResponsiveText size="lg" fontWeight="bold">
							Department: {dept.deptName}
						</ResponsiveText>

						{dept.users.length > 0 && (
							<Box overflowX="auto" w="100%" mt={2}>
							<Table size="sm" variant="striped" minW="750px">
								<Thead>
								<Tr>
									<Th>User Name</Th>
									<Th>Email</Th>
									<Th>Added Date</Th>
									<Th>Remarks</Th>
								</Tr>
								</Thead>
								<Tbody>
								{dept.users.map((user, userIndex) => (
									<Tr key={user.key || userIndex}>
									<Td>{user.userName}</Td>
									<Td>{user.email}</Td>
									<Td>
										{user.addDate
										? new Date(user.addDate).toLocaleDateString()
										: "-"}
									</Td>
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
				<Button colorScheme="blue" type="submit">
					Confirm
				</Button>
				</ModalFooter>
			</Form>
		</Formik>
	);
}