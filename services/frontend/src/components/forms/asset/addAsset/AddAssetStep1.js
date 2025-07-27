import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import ExcelFormControl from '../../utils/ExcelFormControl';
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { useAddAssets } from "./AddAssetsProvider";
import { compareDates, compareStrings, convertExcelDate, validateUniqueValues } from "../../utils/validation";
import { setFieldError } from "../../utils/validation";
import { AddType } from "./AddType";
import { AddButton } from "../../utils/ItemButtons";
import { useForm } from "../../../../context/FormProvider";
import { createNewSubType, createNewType } from "./helpers";
import { useStep } from "../../../../context/StepProvider";
import assetService from "../../../../services/AssetService";

export const AddAssetStep1 = () => {

    const { setFormType, formRef, reinitializeForm } = useForm();
    const { nextStep } = useStep();
    const { handleError } = useUI();
    const { typeOptions, vendorOptions, setSubTypeOptionsDict } = useAddAssets();

    const initialFormValues = {
      types: [createNewType()],
    }

    const setValuesExcel = async (records) => {
      // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
      try {
        const aliases = new Set();
        const serialNumbers = new Set();
        const subTypeSet = new Set();

        const recordsMap = {};

        records.forEach((record) => {

          Object.keys(record).forEach(field => {
            record[field] = field !== 'addDate'
              ? record[field]?.toString().trim()
              : record[field] ? convertExcelDate(record[field], record.__rowNum__) : new Date();
          });

          ['type', 'subType', 'serialNumber'].forEach(field => {
            if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
          });

          const { type, subType, alias, serialNumber, vendorName, cost, location, remarks, addDate } = record;
          
          if (alias && aliases.has(alias)) throw new Error(`Duplicate records for asset tag: ${alias} were found`);
          else if (alias) aliases.add(alias);
          
          if (serialNumbers.has(serialNumber)) throw new Error(`Duplicate records for Serial Number: ${serialNumber} were found`);
          else serialNumbers.add(serialNumber);     

          if (!recordsMap[type]) {
            recordsMap[type] = {};
          }
          
          if (!recordsMap[type][subType]) {
            if (subTypeSet.has(subType)) throw new Error(`Error for ${subType}: Subtype names must be different across types`)
            else subTypeSet.add(subType);
            recordsMap[type][subType] = [];
          }
          
          recordsMap[type][subType].push({
            alias,
            serialNumber,
            vendorName,
            cost,
            addDate,
            location,
            remarks
          });
        });

        const typeIds = typeOptions.map(option => option.typeId); // type options loaded upon form creation

        const subTypesResponse = await assetService.getSubTypeFilters(typeIds);
        const subTypeOptionsMap = subTypesResponse.data;

        const types = [];

        Object.entries(recordsMap).forEach(([typeName, subTypeObjs]) => {
          let typeId = '';
          const type = typeOptions.find(option => compareStrings(option.value, typeName));
          if (type) {
            typeId = type.typeId;
            typeName = type.value; // update the typename
          }

          const subTypes = [];

          Object.entries(subTypeObjs).forEach(([subTypeName, assetObjs]) => {
            let subTypeId = '';
            if (typeId) {
              const subType = subTypeOptionsMap[typeId].find(option => compareStrings(option.value, subTypeName));
              if (subType) {
                subTypeId = subType.subTypeId;
                subTypeName = subType.value;
              }
            }

            const assets = assetObjs.map(asset => {
              let vendorId = '';
              let vendorName = asset.vendorName;
              const vendor = vendorOptions.find(option => compareStrings(option.value, vendorName));
              if (vendor) {
                vendorId = vendor.vendorId;
                vendorName = vendor.value; // update the typename
              }
              return {
                ...asset,
                vendorId,
                vendorName
              }
            })
            
            subTypes.push(createNewSubType({
              subTypeId: subTypeId,
              subTypeName: subTypeName,
              assets: assets,
            }));
          })

          types.push(createNewType({
            typeId: typeId,
            typeName: typeName,
            subTypes: subTypes,
          }))
        })

        // console.log(subTypeOptionsMap);

        setSubTypeOptionsDict(subTypeOptionsMap);
      
        reinitializeForm({
          types: types
        });

      } catch (error) {
        handleError(error);
      }
    };

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
          initialValues={initialFormValues}
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
                            <Text>{`Remove ${type.typeName ? ` ${type.typeName}` : ''}`}</Text>
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