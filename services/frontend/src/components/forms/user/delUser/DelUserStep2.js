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
  Tr,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useDelUsers } from "./DelUsersProvider";
import { useStep } from "../../../../context/StepProvider";

export const DelUserStep2 = () => {
  const { handleSubmit } = useDelUsers();
  const { formData, prevStep } = useStep();

  return formData?.users ? (
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
                  <Th>User Name</Th>
                  <Th>Delete Date</Th>
                  <Th>Remarks</Th>
                </Tr>
              </Thead>
              <Tbody>
                {formData.users.map((user, index) => (
                  <Tr key={user.key || index}>
                    <Td>{user.userName}</Td>
                    <Td>
                      {user.delDate
                        ? new Date(user.delDate).toLocaleDateString()
                        : "-"}
                    </Td>
                    <Td>{user.remarks || "-"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button onClick={prevStep}>Back</Button>
          <Button colorScheme="red" type="submit">
            Confirm Deletion
          </Button>
        </ModalFooter>
      </Form>
    </Formik>
  ) : undefined;
};
