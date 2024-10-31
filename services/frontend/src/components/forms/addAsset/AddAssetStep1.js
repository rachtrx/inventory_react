import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import DateInputControl from "../utils/DateInputControl";
import { useFormModal } from "../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useUI } from "../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createNewType, useAddAssets } from "./AddAssetsProvider";
import { validateUniqueValues } from "../utils/validation";
import { setFieldError } from "../utils/validation";
import { AddType } from "./AddType";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { AddButton } from "../utils/ItemButtons";

export const AddAssetStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useAddAssets();
    const { setFormType, reinitializeForm } = useFormModal();
    const { setLoading, showToast, handleError } = useUI();
    const [ warnings, setWarnings ] = useState({});
    const formRef = useRef(null);
  
    console.log('add asset form rendered');
		console.log(formData);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm]);
    
    const validateFieldWithId = (idDuplicates, labelField, idField, fieldName) => {
      if (idDuplicates.has(idField)) return `${fieldName} names should be unique`;
      if (!labelField) return `${fieldName} is Required`;
      if (idField === '' && labelField !== idField) return `${fieldName} is not found / ambiguous.`;
      return null;
    };
    
    const validateField = (fieldDuplicates, fieldValue, fieldName) => {
      if (fieldDuplicates.has(fieldValue)) return `${fieldName}s should be unique`;
      if (!fieldValue || fieldValue === '') return `${fieldName} is Required`;
      return null;
    }
  
    const validate = values => {
			// console.log(formRef.current?.values);
      const errors = {};
  
      const tIdDuplicates = validateUniqueValues(values.types, ['typeId']);
      const atDuplicates = validateUniqueValues(values.types, ['subTypes', 'assets', 'assetTag']);
      const snDuplicates = validateUniqueValues(values.types, ['subTypes', 'assets', 'serialNumber']);

      values.types.forEach((type, typeIndex) => {
        const typeError = validateFieldWithId(tIdDuplicates, type['typeName'], type['typeId'], "Type");
        if (typeError) {
          setFieldError(errors, ['types', typeIndex, 'typeId'], typeError);
        }
        const stIdDuplicates = validateUniqueValues(type.subTypes, ['subTypeId']);
  
        type.subTypes.forEach((subType, subTypeIndex) => {
          const subTypeError = validateFieldWithId(stIdDuplicates, subType['subTypeName'], subType['subTypeId'], "Sub Type");
          if (subTypeError) {
            setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'subTypeId'], subTypeError);
          }

          subType.assets.forEach((asset, assetIndex) => {
            const atError = validateField(atDuplicates, asset['assetTag'], "Asset Tag");
            if (atError) {
              setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'assetTag'], atError);
            }
            const snError = validateField(snDuplicates, asset['serialNumber'], "Serial Number");
            if (snError) {
              setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'serialNumber'], snError);
            }
          })
        });
      });
    
      return errors;
    };
  
    return (
      <Box>
        <Formik
          initialValues={formData}
          onSubmit={nextStep}
          validate={validate}
          validateOnChange={true}
          // validateOnBlur={true}
          innerRef={formRef}
          // enableReinitialize={true}
        >
          {({ values, errors }) => {
            return (
              <Form>
                <ModalBody>
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['type', 'subType', 'assetTag', 'serialNumber', 'vendor', 'cost', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="types">
                  {typeHelpers => (
                    values.types.map((type, typeIndex, array) => (
											// Change to single asset only
                      <AddType
                        key={type.key}
                        type={type}
                        typeIndex={typeIndex}
                        typeHelpers={typeHelpers}
                        isLast={typeIndex === array.length - 1}
                      >
                        {/* children are the helper functions */}
                        <Flex mt={2} gap={4} justifyContent="space-between">
                          {array.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => typeHelpers.remove(typeIndex)}
                              alignSelf="flex-start"
                              colorScheme="red"
                            >
                            <ResponsiveText>{`Remove ${type.typeName ? ` ${type.typeName}` : ''}`}</ResponsiveText>
                            </Button>
                          )}
                        </Flex>
                        <Divider borderColor="black" borderWidth="2px" my={4} />
                        {typeIndex === array.length - 1 && (
                        <AddButton
                            handleClick={() => typeHelpers.push(createNewType())}
                            label="Add Type"
                        />
                        )}
                      </AddType>
                    ))
                  )}
                  </FieldArray>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                  <Button colorScheme="blue" type="submit" isDisabled={errors.types}>Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };