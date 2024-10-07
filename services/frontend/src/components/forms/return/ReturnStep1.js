import { Box, Button, Divider, Flex, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import InputFormControl from '../utils/InputFormControl';
import SelectFormControl from "../utils/SelectFormControl";
import DateInputControl from "../utils/DateInputControl";
import { formTypes, useFormModal } from "../../../context/ModalProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createNewPeripheral, createNewReturn } from "./Return";
import { useUI } from "../../../context/UIProvider";
import { FieldArray, Form, Formik } from "formik";
import { ReturnProvider } from "../../../context/ReturnProvider";
import assetService from "../../../services/AssetService";
import { v4 as uuidv4 } from 'uuid';

const ReturnStep1 = ({ nextStep, formData, setFormData }) => {

    // REINITIALISE FORM TO INCLUDE ALL POSSIBLE UPDATES
    const [ assetOptions, setAssetOptions ] = useState([]);
    const { setFormType, reinitializeForm, initialValues } = useFormModal();
    const { handleError } = useUI()

    const formRef = useRef(null);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm])

    const createNewPeripheral = (peripheral) => ({
      'key': uuidv4(),
      'id': peripheral.peripheralId || '',
      'peripheralName': peripheral.peripheralName || '',
      'disabled': peripheral.returned,
      'selected': peripheral.selected
    })

    const presetValues = useCallback(async (records) => {
      const returns = [];
      const _assetOptions = {};
  
      try {
        for (const record of records) {
          const assetTag = record.assetTag?.trim();
          if (_assetOptions[assetTag]) {
            throw new Error(`Duplicate records for assetTag: ${assetTag} were found`);
          }
    
          const response = await assetService.searchAssets(assetTag, formTypes.RETURN);
          const foundAssetOptions = response.data;
          if (foundAssetOptions.length !== 1) {
            const ret = createNewReturn({ assetTag });
            returns.push(ret);
          } else {
            const assetId = foundAssetOptions[0].value;
            _assetOptions[assetId] = foundAssetOptions;
    
            const assetResponse = await assetService.fetchReturn(assetId); // Await here works!
            const returnDetails = assetResponse.data;
            
            console.log("Return Details:", returnDetails);
    
            const userNames = [...new Set(record.userNames?.split(',').map(user => user.trim()))];

            const uniquePeripheralIds = returnDetails.users.reduce((acc, user) => {
              if (user.peripherals) {
                user.peripherals.forEach(peripheral => {
                  acc.add(peripheral.peripheralId);
                });
              }
              return acc;
            }, new Set());
    
            // TODO HANDLE MISMATCH USER
            returnDetails.users.forEach(user => {
              const userPeripherals = [];
            
              uniquePeripheralIds.forEach(peripheralId => {
                // Check if the user has this peripheral
                const hasPeripheral = user.peripherals?.some(peripheral => peripheral.id === peripheralId);
            
                // If user does not have this peripheral, create a new one
                if (!hasPeripheral) {
                  const newPeripheral = createNewPeripheral(peripheralId); // Assuming you have a function to create a new peripheral
            
                  // Set 'selected' and 'disabled' properties
                  newPeripheral.selected = userNames.includes(user.userName);
                  newPeripheral.disabled = true;
            
                  // Push to userPeripherals
                  userPeripherals.push(newPeripheral);
                } else {
                  // If the user has the peripheral, retain the original one
                  const existingPeripheral = user.peripherals.find(peripheral => peripheral.id === peripheralId);
                  userPeripherals.push(existingPeripheral);
                }
              });
            
              // Update user's peripherals
              user.peripherals = userPeripherals;
            });
    
            const ret = createNewReturn({ assetId, assetTag }, returnDetails.users);
            console.log(ret);
            returns.push(ret);
          }
        }
    
        setAssetOptions(_assetOptions);
        setFormData({
          returns: returns,
        });
      } catch (error) {
        handleError(error);
      }
    }, [setAssetOptions, setFormData, handleError]);
  
    useEffect(() => {
      if (initialValues) {
        const loadPresetValues = async () => {
          await presetValues([initialValues]);
        };
  
        loadPresetValues();
      }
    }, [initialValues, presetValues]);
  
    return (
      <Box>
        <Formik
          initialValues={formData}
          onSubmit={nextStep}
          // validate={validate}
          validateOnChange={true}
          // validateOnBlur={true}
          innerRef={formRef}
          // enableReinitialize={true}
        >
          {({ values, errors }) => {
            return (
              <Form>
                <ModalBody>
                  <ExcelFormControl loadValues={presetValues} templateCols={['assetTag', 'userNames']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="loans">
                  {returnHelpers => (
                    values.returns.map((ret, returnIndex, array) => (
											// Change to single asset only
                      <ReturnProvider
                        key={ret.key}
                        ret={ret}
                        returnIndex={returnIndex}
                        returnHelpers={returnHelpers}
                        assetOption={ret.assetId ? assetOptions[ret.assetId] : []}
                        // warnings={warnings?.loans?.[loanIndex]}
                        // isLast={loanIndex === array.length - 1}
                      >
                      </ReturnProvider>
                    ))
                  )}
                  </FieldArray>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                  <Button colorScheme="blue" type="submit" isDisabled={errors.loans}>Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };
  
  export default ReturnStep1;