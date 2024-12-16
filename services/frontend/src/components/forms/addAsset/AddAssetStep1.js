import { Box, Button, Separator, Flex } from "@chakra-ui/react";
import { ModalBody, ModalFooter } from "@chakra-ui/modal";
import ExcelFormControl from '../utils/ExcelFormControl';
import DateInputControl from "../utils/DateInputControl";
import { useFormModal } from "../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useUI } from "../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createNewType, useAddAssets } from "./AddAssetsProvider";
import { compareDates, validateUniqueValues } from "../utils/validation";
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

    useEffect(() => {
      console.log("Asset Add Form");
      console.log(formData);
    }, [formData]);

    useEffect(() => {
      reinitializeForm(formRef, formData);
    }, [formData, reinitializeForm]);
    
    const validateFieldName = (nameDuplicates, field, fieldName) => {
      if (nameDuplicates.has(field)) return `${fieldName} names should be unique`;
      if (!field) return `${fieldName} is Required`;
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
  
      const tNameDuplicates = validateUniqueValues(values.types, ['typeName']);
      const atDuplicates = validateUniqueValues(values.types, ['subTypes', 'assets', 'assetTag']);
      const snDuplicates = validateUniqueValues(values.types, ['subTypes', 'assets', 'serialNumber']);

      values.types.forEach((type, typeIndex) => {
        const typeError = validateFieldName(tNameDuplicates, type['typeName'], "Type");
        if (typeError) {
          setFieldError(errors, ['types', typeIndex, 'typeName'], typeError);
        }
        const stNameDuplicates = validateUniqueValues(type.subTypes, ['subTypeName']);
  
        type.subTypes.forEach((subType, subTypeIndex) => {
          const subTypeError = validateFieldName(stNameDuplicates, subType['subTypeName'], "Sub Type");
          if (subTypeError) {
            setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'subTypeName'], subTypeError);
          }

          subType.assets.forEach((asset, assetIndex) => {
            if (!asset['vendorName']) setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'vendorName'], 'Vendor is required');

            const atError = validateField(atDuplicates, asset['assetTag'], "Asset Tag");
            if (atError) {
              setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'assetTag'], atError);
            }
            const snError = validateField(snDuplicates, asset['serialNumber'], "Serial Number");
            if (snError) {
              setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'serialNumber'], snError);
            }

            if (compareDates(asset['addDate'])) {
              setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'addDate'], "Date cannot be after today");
            }
          })
        });
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
          // validateOnBlur={true}
          innerRef={formRef}
          // enableReinitialize={true}
        >
          {({ values, errors }) => {
            return (
              <Form>
                <ModalBody>
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['type', 'subType', 'assetTag', 'serialNumber', 'vendorName', 'cost', 'addDate', 'remarks']}/>
                  <Separator borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="types">
                  {typeHelpers => (
                    values.types.map((type, typeIndex, array) => (
											// Change to single asset only
                      <AddType
                        key={type.key}
                        type={type}
                        typeIndex={typeIndex}
                        typeHelpers={typeHelpers}
                      >
                        {/* children are the helper functions */}
                        <Flex mt={2} gap={4} justifyContent="space-between">
                          {array.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => typeHelpers.remove(typeIndex)}
                              alignSelf="flex-start"
                              colorPalette="red"
                            >
                            <ResponsiveText>{`Remove ${type.typeName ? ` ${type.typeName}` : ''}`}</ResponsiveText>
                            </Button>
                          )}
                        </Flex>
                        <Separator borderColor="black" borderWidth="2px" my={4} />
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
                  <Button colorPalette="blue" type="submit" isDisabled={errors.types}>Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };