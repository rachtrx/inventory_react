import { Box, Button, Divider, Flex, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import ExcelFormControl from '../../utils/ExcelFormControl';
import { useForm } from "../../../../context/FormProvider";
import { FieldArray, Form, Formik } from "formik";
import { useUI } from "../../../../context/UIProvider";
import { useDelAssets } from "./DelAssetsProvider";
import { compareStrings, convertExcelDate, validateUniqueValues } from "../../utils/validation";
import { setFieldError } from "../../utils/validation";
import { AddButton } from "../../utils/ItemButtons";
import { DelAsset } from "./DelAsset";
import { delNewAsset } from "./helpers";
import { useStep } from "../../../../context/StepProvider";
import assetService from "../../../../services/AssetService";

export const DelAssetStep1 = () => {

    const { setAssetOptions } = useDelAssets();
    const { nextStep } = useStep();
    const { setFormType, formRef, reinitializeForm } = useForm();
    const { handleError } = useUI();
    const initialFormValues = {
      assets: [delNewAsset()],
    }
  
    // console.log('add asset form rendered');
		// console.log(formData);

    const setValuesExcel = async (records) => {
      // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
      try {
        const serialNumbers = new Set();

        records.forEach((record) => {

          Object.keys(record).forEach(field => {
            record[field] = field !== 'delDate'
              ? record[field]?.toString().trim()
              : record[field] ? convertExcelDate(record[field], record.__rowNum__) : new Date();
          });

          ['serialNumber'].forEach(field => {
            if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
          });
          
          if (serialNumbers.has(record.serialNumber)) throw new Error(`Duplicate records for serialNumber: ${record.serialNumber} were found`);
          else serialNumbers.add(record.serialNumber);
        });

        const assetResponse = await assetService.fetchAstDel([...serialNumbers]);
        // console.log(assetResponse.data);
        const newAssetOptions = assetResponse.data;
        setAssetOptions(newAssetOptions);

        const assets = records.map((record) => {
          const { serialNumber, remarks, delDate } = record;
          const matchedAssetOption = newAssetOptions.find(option => compareStrings(option.value, serialNumber));

          if (!matchedAssetOption || matchedAssetOption.isDisabled) {
            return {
              serialNumber, // Pass serialNumber regardless of whether id is found
              delDate,
              remarks,
            }
          } else {  
            return {
              assetId: matchedAssetOption ? matchedAssetOption.assetId : null,
              lastEventDate: matchedAssetOption ? matchedAssetOption.lastEventDate : null,
              serialNumber,
              delDate,
              remarks,
            }
          }
        })
      
        reinitializeForm({
          assets: assets.map(asset => delNewAsset(asset))
        });

      } catch (error) {
        handleError(error);
      }
    };

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
                            <Text>{`Remove ${asset.serialNumber ? ` ${asset.serialNumber}` : ''}`}</Text>
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