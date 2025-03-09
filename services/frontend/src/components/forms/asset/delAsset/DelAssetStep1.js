import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from '../../utils/ExcelFormControl';
import DateInputControl from "../../utils/DateInputControl";
import { useFormModal } from "../../../../context/ModalProvider";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useUI } from "../../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { delNewAsset, useDelAssets } from "./DelAssetsProvider";
import { validateUniqueValues } from "../../utils/validation";
import { setFieldError } from "../../utils/validation";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import { AddButton } from "../../utils/ItemButtons";
import { DelAsset } from "./DelAsset";

export const DelAssetStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useDelAssets();
    const { setFormType, reinitializeForm } = useFormModal();
    const formRef = useRef(null);
  
    // console.log('add asset form rendered');
		// console.log(formData);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm]);
    
    const validateFieldWithId = (fieldDuplicates, fieldValue, idValue, fieldName) => {
      if (fieldValue && !idValue) return `${fieldName} not found`;
      if (fieldDuplicates.has(fieldValue)) return `${fieldName}s should be unique`;
      if (!fieldValue || fieldValue === '') return `${fieldName} is Required`;
      return null;
    }
  
    const validate = values => {
			// console.log(formRef.current?.values);
      const errors = {};
  
      const SNDuplicates = validateUniqueValues(values.assets, ['serialNumber']);

      values.assets.forEach((asset, assetIndex) => {

        if (!asset.assetId && asset.serialNumber) setFieldError(errors, ['assets', assetIndex, 'serialNumber'], "Serial Number not found / cannot be deleted");

        const snError = validateFieldWithId(SNDuplicates, asset['serialNumber'], asset['assetId'], "Serial Number");
        if (snError) {
          setFieldError(errors, ['assets', assetIndex, 'serialNumber'], snError);
        }

        if (asset.assetId && !asset.lastEventDate) setFieldError(errors, ['assets', assetIndex, 'delDate'], "Error retrieving last event date");

        // console.log(asset.lastEventDate);
        // console.log(asset.delDate);
        if (new Date(asset.lastEventDate) > asset.delDate) {
          setFieldError(errors, ['assets', assetIndex, 'delDate'], `Date must be after last event date ${asset.lastEventDate}`); // TODO convert to string
        }
      });
    
      // console.log(errors);
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['serialNumber', 'delDate', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="assets">
                  {assetHelpers => (
                    values.assets.map((asset, assetIndex, array) => (
											// Change to single asset only
                      <DelAsset
                        key={asset.key}
                        field={`assets.${assetIndex}`}
                        asset={asset}
                      >
                        {/* children are the helper functions */}
                        <Flex mt={2} gap={4} justifyContent="space-between">
                          {array.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => assetHelpers.remove(assetIndex)}
                              alignSelf="flex-start"
                              colorScheme="red"
                            >
                            <ResponsiveText>{`Remove ${asset.serialNumber ? ` ${asset.serialNumber}` : ''}`}</ResponsiveText>
                            </Button>
                          )}
                        </Flex>
                        <Divider borderColor="black" borderWidth="2px" my={4} />
                        {assetIndex === array.length - 1 && (
                        <AddButton
                            handleClick={() => assetHelpers.push(delNewAsset())}
                            label="Add Asset"
                        />
                        )}
                      </DelAsset>
                    ))
                  )}
                  </FieldArray>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" onClick={() => setFormType(null)}>Cancel</Button>
                  <Button colorScheme="blue" type="submit" isDisabled={errors.assets}>Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };