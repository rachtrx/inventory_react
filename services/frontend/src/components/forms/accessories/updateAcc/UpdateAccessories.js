import { Box, Button, Divider, Flex, ModalBody, ModalFooter } from "@chakra-ui/react";
import { useFormModal } from "../../../../context/ModalProvider";
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import accessoryService from "../../../../services/AccessoryService";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "../../../../context/LoadingProvider";
import { UpdateAccessory } from "./UpdateAccessory";
import { createNewAccessory } from "./helpers";

const UpdateAccessories = () => {

  // console.log('update acc form rendered');

  const { setFormType, initialValues, reinitializeForm, triggerRefresh } = useFormModal()
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    accessories: [createNewAccessory()]
  });

  const [accessoryOptions, setAccessoryOptions] = useState([])

  useEffect(() => {
  }, [formData, initialValues]);

  useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm])

  useEffect(() => {
    console.log(initialValues);
    if (!initialValues.accNames?.length) return;

    setAccessoryOptions(initialValues.accNames.map(accType => ({
      label: accType.accessoryName,
      value: accType.accessoryName,
      accessoryTypeId: accType.accessoryTypeId
    })))

    setFormData({accessories: initialValues.accNames.map(accType => createNewAccessory(accType))})
  }, [initialValues])

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    // console.log('Manual Form Values:', values);
    try {
      await accessoryService.addAccessories(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Accessories successfully loaned', 'success', 500);
      setFormType(null);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };

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

    if (AccTypeIdDuplicates.size > 0) {
      values.accessories.forEach((accessory, index) => {
        if (AccTypeIdDuplicates.has(accessory['accessoryTypeId'])) {
          if (!errors.accessories) errors.accessories = [];
          errors.accessories[index] = { ...errors.accessories[index], 'accessoryName': 'Accessories must be unique' };
        }

        else if (accessory.accessoryName && !accessory.accessoryTypeId) {
          if (!errors.accessories) errors.accessories = [];
          errors.accessories[index] = { ...errors.accessories[index], 'accessoryName': `Please create new accessory type ${accessory['accessoryName']}` };
        }
      });
    }
    // console.log(errors);

    return errors;
  };

  const addNewAccessory = async (accessoryName) => {
    try {
      setLoading(true);
      const response = await accessoryService.createAccessory(accessoryName);
      setAccessoryOptions(oldArray => [
        ...oldArray.filter(item => !(item.value === accessoryName && !item.accessoryTypeId)),
        { 
          accessoryTypeId: response.data.newAccType.accessoryTypeId,
          accessoryName: response.data.newAccType.accessoryName,
          stock: response.data.newAccType.stock,
          value: response.data.newAccType.accessoryName,
          label: response.data.newAccType.accessoryName
        }
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  }
  
  return (
    <Box>
        <Formik
          initialValues={formData}
          onSubmit={handleSubmit}
          validate={validate}
          validateOnChange={true}
          validateOnBlur={true}
          innerRef={formRef}
        >
          {({ values, errors }) => (
          <Form>
            <ModalBody w='100%'>
              <Divider borderColor="black" borderWidth="2px" my={2}/>
              <FieldArray name='accessories'>
                {accessoryHelpers => values.accessories.map((accessory, index, array) => (
                  <UpdateAccessory
                    accessory={accessory}
                    accessoryOptions={accessoryOptions}
                    addNewAccessory={addNewAccessory}
                    accessoryHelpers={accessoryHelpers}
                    index={index}
                  >
                    <Flex alignSelf="flex-end" gap={2} marginBottom={4}>
                      {index === array.length - 1 && (
                      <Button mt={4} type="button" onClick={() => accessoryHelpers.push(addNewAccessory())}>
                        <ResponsiveText>Add Accessory</ResponsiveText>
                      </Button>
                      )}
                    </Flex>
                  </UpdateAccessory>
                ))}
              </FieldArray>
              </ModalBody>
              <ModalFooter>
                <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                <Button colorScheme="blue" type="submit" isDisabled={errors.accessories}>Submit</Button>
            </ModalFooter>
          </Form>
        )}
        </Formik>
    </Box>
  );
};

export default UpdateAccessories;