import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Spacer, VStack } from "@chakra-ui/react";
import ExcelFormControl from '../../../utils/ExcelFormControl';
import DateInputControl from "../../../utils/DateInputControl";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { useUI } from "../../../../../context/UIProvider";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { compareDates, validateUniqueValues } from "../../../utils/validation";
import { setFieldError } from "../../../utils/validation";
import { AddTag, AddType } from "./AddTag";
import { ResponsiveText } from "../../../../utils/ResponsiveText";
import { AddButton } from "../../../utils/ItemButtons";
import { useFormModal } from "../../../../../context/ModalProvider";
import { createNewTag, useAssetTags } from "../AssetTagsProvider";

export const AddAssetTagsStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useAssetTags();
    const { setFormType, reinitializeForm } = useFormModal();
    const formRef = useRef(null);

    useEffect(() => {
      // console.log("Asset Tag Add Form");
      // console.log(formData);
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
      
      const tagDuplicates = validateUniqueValues(values.tags, ['tagName']);

      values.tags.forEach((tag, tagIndex) => {
        const tagError = validateFieldName(tagDuplicates, tag['tagName'], "Tag");
        if (tagError) {
          setFieldError(errors, ['tags', tagIndex, 'tagName'], tagError);
        }

        const snDuplicates = validateUniqueValues(values.tags, ['assets', 'serialNumber']);
  
        tag.assets.forEach((asset, assetIndex) => {
          if (asset.serialNumber && asset.assetId === '') {
            setFieldError(errors, ['tags', tagIndex, 'assets', assetIndex, 'serialNumber'], `${asset.serialNumber} does not exist!`);
          } else if (asset.assetTagId) {
            setFieldError(errors, ['tags', tagIndex, 'assets', assetIndex, 'serialNumber'], `${asset.serialNumber} already has ${tag.tagName} tag`);
          } else {
            const snError = validateField(snDuplicates, asset['serialNumber'], "Serial Number");
            if (snError) {
              setFieldError(errors, ['tags', tagIndex, 'assets', assetIndex, 'serialNumber'], snError);
            }
          }
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['tag', 'serialNumber', 'remarks']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="tags">
                  {tagHelpers => (
                    values.tags.map((tag, tagIndex, array) => (
											// Change to single asset only
                      <AddTag
                        key={tag.key}
                        tag={tag}
                        tagIndex={tagIndex}
                        tagHelpers={tagHelpers}
                      >
                        {/* children are the helper functions */}
                        <Flex mt={2} gap={4} justifyContent="space-between">
                          {array.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => tagHelpers.remove(tagIndex)}
                              alignSelf="flex-start"
                              colorScheme="red"
                            >
                            <ResponsiveText>{`Remove ${tag.tagName ? ` ${tag.tagName}` : ''}`}</ResponsiveText>
                            </Button>
                          )}
                        </Flex>
                        <Divider borderColor="black" borderWidth="2px" my={4} />
                        {tagIndex === array.length - 1 && (
                        <AddButton
                            handleClick={() => tagHelpers.push(createNewTag())}
                            label="Add Tag Name"
                        />
                        )}
                      </AddTag>
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