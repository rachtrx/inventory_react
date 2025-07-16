import {
  Box,
  Button,
  Flex,
  ModalBody,
  ModalFooter,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { ResponsiveText } from "../../../../utils/ResponsiveText";
import { useAssetTags } from "../AssetTagsProvider";

export const DelAssetTagsStep2 = () => {
  const { formData, handleDelTagsSubmit, prevStep } = useAssetTags();

  return (
    <Formik
      initialValues={formData}
      onSubmit={handleDelTagsSubmit}
      validateOnChange={true}
      enableReinitialize={true}
    >
      <Form>
        <ModalBody>
          {formData.tags.map((tag, tagIndex) => (
            <Flex
              key={tag.key}
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

              {tag.assets.length > 0 && (
                <Box overflowX="auto" w="100%" mt={2}>
                  <Table size="sm" variant="striped" minW="500px">
                    <Thead>
                      <Tr>
                        <Th>Serial Number</Th>
                        <Th>Remarks</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {tag.assets.map((asset, assetIndex) => (
                        <Tr key={asset.key}>
                          <Td>{asset.serialNumber}</Td>
                          <Td>{asset.remarks || "-"}</Td>
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
            Confirm Deletion
          </Button>
        </ModalFooter>
      </Form>
    </Formik>
  );
};
