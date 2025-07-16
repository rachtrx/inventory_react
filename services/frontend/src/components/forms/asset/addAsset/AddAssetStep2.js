import { Box, Button, Flex, ListItem, ModalBody, ModalFooter, Table, Tbody, Td, Th, Thead, Tr, UnorderedList, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import { Form, Formik } from "formik";
import { useAddAssets } from "./AddAssetsProvider";

export const AddAssetStep2 = () => {
  const { formData, handleSubmit, prevStep } = useAddAssets();

  return (
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
              <ResponsiveText size="lg" fontWeight="bold">
                Type: {type.typeName}
              </ResponsiveText>

              {type.subTypes.map((subType, subTypeIndex) => (
                <VStack key={subType.key}>
                  <ResponsiveText fontWeight="semibold">
                    SubType: {subType.subTypeName}
                  </ResponsiveText>

                  {subType.assets.length > 0 && (
                    <Box overflowX="auto" w="100%">
  										<Table size="sm" variant="striped" minW="750px">
											<Thead>
												<Tr>
													<Th>Serial Number</Th>
													<Th>Alias</Th>
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
  );
};
