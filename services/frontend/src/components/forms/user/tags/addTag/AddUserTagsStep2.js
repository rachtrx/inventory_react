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
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { ResponsiveText } from "../../../../utils/ResponsiveText";
import { useUserTags } from "../UserTagsProvider";

export const AddUserTagsStep2 = () => {
  const { formData, handleAddTagsSubmit, prevStep } = useUserTags();

  return (
    <Formik
      initialValues={formData}
      onSubmit={handleAddTagsSubmit}
      validateOnChange={true}
      enableReinitialize={true}
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
          <Button colorScheme="blue" type="submit">
            Confirm
          </Button>
        </ModalFooter>
      </Form>
    </Formik>
  );
};
