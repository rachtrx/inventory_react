import { Box, Button, Separator } from "@chakra-ui/react";
import { ModalBody, ModalFooter } from "@chakra-ui/modal";
import ExcelFormControl from '../utils/ExcelFormControl';
import InputFormControl from '../utils/InputFormControl';
import SelectFormControl from "../utils/SelectFormControl";
import DateInputControl from "../utils/DateInputControl";
import { formTypes, useFormModal } from "../../../context/ModalProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createNewAccessory, createNewReturn } from "./Return";
import { useUI } from "../../../context/UIProvider";
import { FieldArray, Form, Formik } from "formik";
import { ReturnProvider } from "./ReturnProvider";
import assetService from "../../../services/AssetService";
import { v4 as uuidv4 } from 'uuid';
import { useReturns } from "./ReturnsProvider";

const ReturnStep1 = () => {

    // REINITIALISE FORM TO INCLUDE ALL POSSIBLE UPDATES
    const [ assetOptions, setAssetOptions ] = useState([]);
    const { setFormType, reinitializeForm, initialValues } = useFormModal();
    const { handleError } = useUI()
    const { nextStep, formData, setValuesExcel } = useReturns();
    const formRef = useRef(null);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm])

    const validate = (values) => {
      const errors = {};
      const assetIds = new Set();
  
      // Validate 'returns' for duplicate assetIds and assetTag !== assetId
      values.returns.forEach((ret, returnIndex) => {
        // Check for duplicate assetIds
        if (ret.assetId && assetIds.has(ret.assetId)) {
          errors.returns = errors.returns || {};
          errors.returns[returnIndex] = {
            assetId: `Duplicate Asset Tag ${ret.assetTag} found`
          };
        } else {
          assetIds.add(ret.assetId);
        }
  
        // Check if assetTag equals assetId
        if (ret.assetTag === ret.assetId) {
          errors.returns = errors.returns || {};
          errors.returns[returnIndex] = {
            ...errors.returns[returnIndex],
            assetId: `Asset Tag ${ret.assetTag} was not found`
          };
        }
      });
  
      return errors;
    }
  
    return (
      <Box>
        <Formik
          initialValues={formData}
          onSubmit={nextStep}
          // validate={validate}
          validateOnChange={true}
          // validateOnBlur={true}
          innerRef={formRef}
          validate={validate}
          // enableReinitialize={true}
        >
          {({ values, errors }) => {
            return (
              <Form>
                <ModalBody>
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['assetTag', 'remarks']}/>
                  <Separator borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="returns">
                  {returnHelpers => (
                    values.returns.map((ret, returnIndex, array) => (
											// Change to single asset only
                      <ReturnProvider
                        key={ret.key}
                        ret={ret}
                        returnIndex={returnIndex}
                        returnHelpers={returnHelpers}
                        isLast={returnIndex === array.length - 1}
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
                  <Button colorPalette="blue" type="submit" isDisabled={errors.returns}>Next</Button>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Box>
    );
  };
  
  export default ReturnStep1;