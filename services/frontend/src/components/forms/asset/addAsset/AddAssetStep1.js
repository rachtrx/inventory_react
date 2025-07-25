import { Box, Button, Divider, Flex, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelFormControl from '../../utils/ExcelFormControl';
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { useAddAssets } from "./AddAssetsProvider";
import { compareDates, validateUniqueValues } from "../../utils/validation";
import { setFieldError } from "../../utils/validation";
import { AddType } from "./AddType";
import { ResponsiveText } from "../../../utils/ResponsiveText";
import { AddButton } from "../../utils/ItemButtons";
import { useFormModal } from "../../../../context/ModalProvider";
import { createNewType } from "./helpers";

export const AddAssetStep1 = () => {

    const { nextStep, formData, setValuesExcel } = useAddAssets();
    const { setFormType, formRef } = useFormModal();
    const { handleError } = useUI();

    // useEffect(() => {
    //   console.log("Asset Add Form");
    //   console.log(formData);
    // }, [formData]);
    
    const validateFieldName = (nameDuplicates, field, fieldName) => {
      if (nameDuplicates.has(field)) return `${fieldName} names should be unique`;
      if (!field) return `${fieldName} is Required`;
      return null;
    };
    
    const validateField = (fieldDuplicates, fieldValue, fieldName, required = true) => {
      if (fieldDuplicates.has(fieldValue)) return `${fieldName}s should be unique`;
      if (!required || (fieldValue && fieldValue !== "")) return null;
      return `${fieldName} is Required`;
    }
  
    const validate = values => {
			// console.log(formRef.current?.values);
      const errors = {};
  
      const tNameDuplicates = validateUniqueValues(values.types, ['typeName']);
      const atDuplicates = validateUniqueValues(values.types, ['subTypes', 'assets', 'alias']);
      const snDuplicates = validateUniqueValues(values.types, ['subTypes', 'assets', 'serialNumber']);

      values.types.forEach((type, typeIndex) => {
        const typeError = validateFieldName(tNameDuplicates, type['typeName'], "Type");

        if (typeError) setFieldError(errors, ['types', typeIndex, 'typeName'], typeError);
        
        if (type['typeName'] && !type['typeId']) setFieldError(errors, ['types', typeIndex, 'typeName'], `Please create new type ${type['typeName']}`);

        const stNameDuplicates = validateUniqueValues(type.subTypes, ['subTypeName']);
        type.subTypes.forEach((subType, subTypeIndex) => {
          const subTypeError = validateFieldName(stNameDuplicates, subType['subTypeName'], "Sub Type");
          if (subTypeError) {
            setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'subTypeName'], subTypeError);
          }
          if (subType['subTypeName'] && !subType['subTypeId']) setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'subTypeName'], `Please create new sub type ${subType['subTypeName']}`);

          subType.assets.forEach((asset, assetIndex) => {
            if (!asset['vendorName']) setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'vendorName'], 'Vendor is required');
            if (asset['vendorName'] && !asset['vendorId']) setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'vendorName'], `Please create new vendor ${asset['vendorName']}`);

            const atError = validateField(atDuplicates, asset['alias'], "Alias", false);
            if (atError) {
              setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'alias'], atError);
            }

            const snError = validateField(snDuplicates, asset['serialNumber'], "Serial Number");
            if (snError) {
              setFieldError(errors, ['types', typeIndex, 'subTypes', subTypeIndex, 'assets', assetIndex, 'serialNumber'], snError);
            }

            if (asset['addDate'] && compareDates(asset['addDate'])) {
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['type', 'subType', 'alias', 'serialNumber', 'vendorName', 'cost', 'addDate', 'location', 'remarks']}/>
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
            );
          }}
        </Formik>
      </Box>
    );
  };