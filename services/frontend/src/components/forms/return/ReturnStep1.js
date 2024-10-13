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
import { useReturns } from "../../../context/ReturnsProvider";

const ReturnStep1 = () => {

    // REINITIALISE FORM TO INCLUDE ALL POSSIBLE UPDATES
    const [ assetOptions, setAssetOptions ] = useState([]);
    const { setFormType, reinitializeForm, initialValues } = useFormModal();
    const { handleError } = useUI()
    const { nextStep, formData, setValuesExcel } = useReturns();

    const formRef = useRef(null);

    useEffect(() => reinitializeForm(formRef, formData), [formData, reinitializeForm])
  
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['assetTag']}/>
                  <Divider borderColor="black" borderWidth="2px" my={2} />
                  <FieldArray name="returns">
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