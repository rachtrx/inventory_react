
import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { UpdateAccessory } from "./UpdateAccessory";
import { createNewAccessory } from "./helpers";
import { useUpdateAccessories } from "./UpdateAccessoriesProvider";
import ExcelFormControl from "../../utils/ExcelFormControl";
import { setFieldError } from "../../utils/validation";

export const UpdateAccessoriesStep1 = () => {

  // console.log('update acc form rendered');

  const { formRef, setFormType, initialValues } = useFormModal()
	const { formData, nextStep, setValuesExcel } = useUpdateAccessories();
	const { handleError } = useUI();

  const validateUniqueAccTypeIDs = (accessories) => {
    const AccTypeIDSet = new Set();
    const duplicates = new Set();
    accessories.forEach(accessory => {
			if (AccTypeIDSet.has(accessory['accessoryTypeId']) && accessory['accessoryTypeId'] !== '') {
					duplicates.add(accessory['accessoryTypeId']);
			}
			AccTypeIDSet.add(accessory['accessoryTypeId']);
    });
    return duplicates;
  };

  const validate = values => {
    // console.log('Running validation');
    // console.log(values);
    const errors = {};
    // Implement validation logic
    const AccTypeIdDuplicates = validateUniqueAccTypeIDs(values.accessories);

    values.accessories.forEach((accessory, index) => {
			if (AccTypeIdDuplicates.has(accessory['accessoryTypeId'])) {
				setFieldError(errors, ['accessories', index, 'accessoryName'], 'Accessories must be unique')
			}

			else if (accessory.accessoryName && !accessory.accessoryTypeId) {
				setFieldError(errors, ['accessories', index, 'accessoryName'], `Please create new accessory type ${accessory['accessoryName']}`)
			} 

			else if (!accessory.accessoryName) {
				setFieldError(errors, ['accessories', index, 'accessoryName'], `Accessory required.`)
			}

			const count = Number(accessory.count) || 0;
			if (count === 0) setFieldError(errors, ['accessories', index, 'count'], `Count must be a non-zero integer.`)
		});
    console.log(errors);

    return errors;
  };
  
  return (
    <Box>
        <Formik
          initialValues={formData}
          onSubmit={nextStep}
          validate={validate}
          validateOnChange={true}
          validateOnBlur={true}
          innerRef={formRef}
        >
          {({ values, errors }) => (
          <Form>
            <ModalBody w='100%'>
							<ExcelFormControl loadValues={setValuesExcel} templateCols={['accessoryName', 'change']}/>
              <Divider borderColor="black" borderWidth="2px" my={2}/>
              <FieldArray name='accessories'>
                {accessoryHelpers => values.accessories.map((accessory, index, array) => (
                  <UpdateAccessory
                    accessory={accessory}
                    accessoryHelpers={accessoryHelpers}
                    index={index}
                  >
                    <Flex alignSelf="flex-end" gap={2} marginBottom={4}>
                      {index === array.length - 1 && !Object.values(initialValues || {}).length && (
                      <Button mt={4} type="button" onClick={() => accessoryHelpers.push(createNewAccessory())}>
                        <Text>Add Accessory</Text>
                      </Button>
                      )}
                    </Flex>
                  </UpdateAccessory>
                ))}
              </FieldArray>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                <Button 
									colorScheme="blue" 
									type="submit"
									onClick={() => {
										if (Object.keys(errors).length !== 0) {
											handleError("Please check for invalid data in form")
										}
									}}
								>Next</Button>
            </ModalFooter>
          </Form>
        )}
        </Formik>
    </Box>
  );
};
