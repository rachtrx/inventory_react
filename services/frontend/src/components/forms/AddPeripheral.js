import { Box, Button, Divider, Flex, IconButton, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelToggle from "./utils/ExcelToggle";
import InputFormControl from './utils/InputFormControl';
import ExcelFormControl from './utils/ExcelFormControl';
import { CreatableSingleSelectFormControl, PeripheralSearchFormControl, SearchFormControl } from "./utils/SelectFormControl";
import { useFormModal, actionTypes } from "../../context/ModalProvider";
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../context/UIProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import peripheralService from "../../services/PeripheralService";
import { MdRemoveCircleOutline } from "react-icons/md";
import { useState } from "react";

export const addNewPeripheral = () => ({
	'id': '',
	'count': null,
})

const AddPeripheral = () => {

  console.log('loan form rendered');

  const { isExcel, onModalClose, dispatch } = useFormModal()
  const { setLoading, showToast, handleError } = useUI();
  const { handlePeripheralSearch } = useFormModal();

  const initialValuesManual = {
    peripherals: [addNewPeripheral()]
  };

  const initialValuesExcel = {
    file: null
  };

  const handleSubmitManual = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await peripheralService.addPeripherals(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Peripherals successfully loaned', 'success', 500);
      dispatch({ type: actionTypes.SET_FORM_TYPE, payload: null })
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };

  const handleSubmitExcel = (values, actions) => {
    console.log('Excel Form Values:', values);
    actions.setSubmitting(false);
    // Handle Excel file upload
  };

  const validateUniquePeripheralIDs = (peripherals) => {
    const PeripheralIDSet = new Set();
    const duplicates = new Set();
    peripherals.forEach(peripheral => {
        if (PeripheralIDSet.has(peripheral['id']) && peripheral['id'] !== '') {
            duplicates.add(peripheral['id']);
        }
        PeripheralIDSet.add(peripheral['id']);
    });
    return duplicates;
  };

  const validate = values => {
    console.log('Running validation');
    console.log(values);
    const errors = {};
    // Implement validation logic
    const PeripheralIDDuplicates = validateUniquePeripheralIDs(values.peripherals);

    if (PeripheralIDDuplicates.size > 0) {
      values.peripherals.forEach((peripheral, index) => {
        if (PeripheralIDDuplicates.has(peripheral['id'])) {
          if (!errors.peripherals) errors.peripherals = [];
          errors.peripherals[index] = { ...errors.peripherals[index], 'id': 'Peripherals must be unique' };
        }
      });
    }
    // console.log(errors);

    return errors;
  };
  
  return (
    <Box>
      {!isExcel ? (
        <Formik
          initialValues={initialValuesManual}
          onSubmit={handleSubmitManual}
          validate={validate}
          validateOnChange={true}
          validateOnBlur={true}
        >
        {formikProps => (
          <Form>
            <ModalBody w='100%'>
            <Divider borderColor="black" borderWidth="2px" my={2}/>
            <FieldArray name='peripherals'>
              {peripheralHelpers => formikProps.values.peripherals.map((peripheral, index, array) => (
                <Box>
                  <Flex key={index} gap={4} alignItems="flex-start">
                    <SearchFormControl
                      name={`peripherals.${index}.id`}
                      searchFn={handlePeripheralSearch}
                    />
                    <InputFormControl 
                      name={`peripherals.${index}.count`} 
                      type="number" 
                      placeholder="Enter count" 
                    />
                    <IconButton
                      icon={<MdRemoveCircleOutline />}
                      aria-label="Remove Tag"
                      onClick={() => peripheralHelpers.remove(index)}
                      isDisabled={formikProps.values.peripherals.length === 1}
                    />
                  </Flex>
                <Flex alignSelf="flex-end" gap={2} marginBottom={4}>
                  {index === array.length - 1 && (
                    <Button mt={4} type="button" onClick={() => peripheralHelpers.push(addNewPeripheral())}>
                      <ResponsiveText>Add Peripheral</ResponsiveText>
                    </Button>
                  )}
                </Flex>
                </Box>
              ))}
            </FieldArray>
            </ModalBody>
            <ModalFooter>
            <Button variant="outline" onClick={() => {
              formikProps.resetForm()
              onModalClose()
            }}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Submit
            </Button>
          </ModalFooter>
          </Form>
        )}
        </Formik>
      ) : (
        <Formik
          initialValues={initialValuesExcel}
          onSubmit={handleSubmitExcel}
        >
          <Form>
            <ModalBody>
              <ExcelFormControl />
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onModalClose}>Cancel</Button>
              <Button colorScheme="blue" type="submit">Upload Excel</Button>
            </ModalFooter>
          </Form>
        </Formik>
      )}
    </Box>
  );
};

export default AddPeripheral;