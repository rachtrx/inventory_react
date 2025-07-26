
import { Box, Button, Flex, ModalBody, ModalFooter, Table, Tbody, Td, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import { Form, Formik } from "formik";
import { useUpdateAccessories } from "./UpdateAccessoriesProvider";

export const UpdateAccessoriesStep2 = () => {
  const { formData, handleSubmit, prevStep } = useUpdateAccessories();

	const getColor = (total) => total >= 0 ? "green" : "red"

  return (
    <Formik
			initialValues={formData}
			onSubmit={handleSubmit}
			enableReinitialize
		>
			<Form>
				<ModalBody>
					{formData.accessories.length > 0 ? (
						<Box overflowX="auto" w="100%">
							<Table size="sm" variant="striped" minW="600px">
								<Thead>
									<Tr>
										<Th>Accessory Name</Th>
										<Th>Count</Th>
										<Th>New Available</Th>
										<Th>Remarks</Th>
									</Tr>
								</Thead>
								<Tbody>
									{formData.accessories.map(accessory => {
										const count = Number(accessory.count) || 0;
										const stock = Number(accessory.stock) || 0;

										return (
											<Tr key={accessory.key}>
												<Td>{accessory.accessoryName}</Td>
												<Td color={getColor(count)}>{count}</Td>
												<Td color={getColor(stock+count)}>{stock+count}</Td>
												<Td>{accessory.remarks || '-'}</Td>
											</Tr>
										);
									})}
								</Tbody>
							</Table>
						</Box>
					) : (
						<ResponsiveText>No accessories selected.</ResponsiveText>
					)}
				</ModalBody>

				<ModalFooter>
					<Button onClick={prevStep}>Back</Button>
					<Button colorScheme="blue" type="submit">Submit</Button>
				</ModalFooter>
			</Form>
		</Formik>
  );
};
