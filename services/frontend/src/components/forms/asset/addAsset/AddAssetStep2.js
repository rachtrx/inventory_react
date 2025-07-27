import { Box, Button, Flex, ModalBody, ModalFooter, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useAddAssets } from "./AddAssetsProvider";
import { useStep } from "../../../../context/StepProvider";

export const AddAssetStep2 = () => {
  const { handleSubmit } = useAddAssets();
  const { prevStep, formData } = useStep();

  return formData?.types ? (
    <Formik
      initialValues={formData}
      onSubmit={handleSubmit}
      validateOnChange={true}
      enableReinitialize={true}
    >
      <Form>
        <ModalBody>
          {formData.types.map((type, typeIndex) => (
            <Flex
              key={type.key}
              direction="column"
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              p={4}
              mb={4}
              boxShadow="sm"
            >
              <Text fontSize="lg" fontWeight="bold">
                Type: {type.typeName}
              </Text>

              {type.subTypes.map((subType, subTypeIndex) => (
                <VStack key={subType.key}>
                  <Text fontWeight="semibold">
                    SubType: {subType.subTypeName}
                  </Text>

                  {subType.assets.length > 0 && (
                    <Box overflowX="auto" w="100%">
  										<Table size="sm" variant="striped" minW="750px">
											<Thead>
												<Tr>
													<Th>Serial Number</Th>
													<Th>Asset Tag</Th>
													<Th>Vendor</Th>
													<Th>Cost</Th>
													<Th>Added Date</Th>
													<Th>Location</Th>
													<Th>Remarks</Th>
												</Tr>
											</Thead>
											<Tbody>
												{subType.assets.map((asset) => (
													<Tr key={asset.key}>
														<Td>{asset.serialNumber}</Td>
														<Td>{asset.alias}</Td>
														<Td>{asset.vendorName}</Td>
														<Td>${Number(asset.cost).toFixed(2)}</Td>
														<Td>{new Date(asset.addDate).toLocaleDateString()}</Td>
														<Td>{asset.location}</Td>
														<Td>{asset.remarks || '-'}</Td>
													</Tr>
												))}
											</Tbody>
										</Table>
									</Box>
                  )}
                </VStack>
              ))}
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
};
