import {
  Box,
  Button,
  ModalBody,
  ModalFooter,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useDelAssets } from "./DelAssetsProvider";
import { useStep } from "../../../../context/StepProvider";

export const DelAssetStep2 = () => {
  const { handleSubmit } = useDelAssets();
  const { formData, prevStep } = useStep();

  return formData?.assets ? (
    <Formik
      initialValues={formData}
      onSubmit={handleSubmit}
      validateOnChange={true}
      enableReinitialize={true}
    >
      <Form>
        <ModalBody>
          <Box overflowX="auto" w="100%">
            <Table size="sm" variant="striped" minW="600px">
              <Thead>
                <Tr>
                  <Th>Serial Number</Th>
                  <Th>Delete Date</Th>
                  <Th>Remarks</Th>
                </Tr>
              </Thead>
              <Tbody>
                {formData.assets.map((asset) => (
                  <Tr key={asset.key}>
                    <Td>{asset.serialNumber}</Td>
                    <Td>
                      {asset.delDate
                        ? new Date(asset.delDate).toLocaleDateString()
                        : "-"}
                    </Td>
                    <Td>{asset.remarks || "-"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button onClick={prevStep}>Back</Button>
          <Button colorScheme="blue" type="submit">
            Submit
          </Button>
        </ModalFooter>
      </Form>
    </Formik>
  ) : undefined;
};
