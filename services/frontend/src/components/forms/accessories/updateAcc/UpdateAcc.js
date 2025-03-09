import { Box, Button, Divider, Flex, IconButton, ModalBody, ModalFooter } from "@chakra-ui/react";
import InputFormControl from '../../utils/InputFormControl';
import ExcelFormControl from '../../utils/ExcelFormControl';
import { SearchCreatableSingleSelectFormControl, SearchFormControl } from "../../utils/SelectFormControl";
import { useFormModal, actionTypes } from "../../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import accessoryService from "../../../../services/AccessoryService";
import { MdRemoveCircleOutline } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { RemoveButton } from "../../utils/ItemButtons";
import { v4 as uuidv4 } from 'uuid';
import { useLoading } from "../../../../context/LoadingProvider";

export const addNewAccessory = (accessory=null) => {
  return {
    'key': uuidv4(),
	  'accessoryTypeId': accessory?.accessoryTypeId || "",
    'accessoryName': accessory?.accessoryName || "",
	  'count': 0,
    'remarks': ""
  }
}

const UpdateAcc = () => {

  // console.log('update acc form rendered');

  const { setFormType, initialValues, handleAccessorySearch, reinitializeForm } = useFormModal()
  const { showToast, handleError } = useUI();
  const { setLoading } = useLoading();
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    accessories: [addNewAccessory()]
  });

  const [accessoryOptions, setAccessoryOptions] = useState([])

  useEffect(() => {
    // console.log("Accessory Add Form");
    // console.log(initialValues);
    // console.log(formData);
  }, [formData, initialValues]);

  useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm])

  useEffect(() => {
    if (!initialValues.accNames?.length) return;

    console.log(initialValues);

    setAccessoryOptions(initialValues.accNames.map(accType => ({
      label: accType.accessoryName,
      value: accType.accessoryName,
      accessoryTypeId: accType.accessoryTypeId
    })))

    setFormData({accessories: initialValues.accNames.map(accType => addNewAccessory(accType))})
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
      });
    }
    // console.log(errors);

    return errors;
  };

  const updateAccessoryFields = (index, selected, setFieldValue) => {
		setFieldValue(`accessories.${index}.accessoryTypeId`, selected?.accessoryTypeId || '');
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
          {({ values, errors, setFieldValue }) => (
          <Form>
            <ModalBody w='100%'>
            <Divider borderColor="black" borderWidth="2px" my={2}/>
            <FieldArray name='accessories'>
              {accessoryHelpers => values.accessories.map((accessory, index, array) => (
                <Box key={accessory.key}>
                  <ResponsiveText size="lg">{`Accessory #${index+1}`}</ResponsiveText>
                  <Flex direction="column" gap={2}>
                    <Flex gap={4} alignItems="flex-start">
                      <SearchCreatableSingleSelectFormControl
                        name={`accessories.${index}.accessoryName`}
                        searchFn={handleAccessorySearch}
                        updateFields={(selected) => updateAccessoryFields(index, selected, setFieldValue)}
                        initialOptions={accessoryOptions}
                      >
                        <InputFormControl
                          name={`accessories.${index}.count`}
                          type="number"
                          placeholder="Enter count"
                        />
                        <RemoveButton
                          ariaLabel="Remove Accessory"
                          handleClick={() => accessoryHelpers.remove(index)}
                          isDisabled={values.accessories.length === 1}
                        />
                      </SearchCreatableSingleSelectFormControl>
                    </Flex>
                    <InputFormControl name={`accessories.${index}.remarks`} label={`Update Remarks`}/>
                  </Flex>
                <Flex alignSelf="flex-end" gap={2} marginBottom={4}>
                  {index === array.length - 1 && (
                    <Button mt={4} type="button" onClick={() => accessoryHelpers.push(addNewAccessory())}>
                      <ResponsiveText>Add Accessory</ResponsiveText>
                    </Button>
                  )}
                </Flex>
                </Box>
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

export default UpdateAcc;