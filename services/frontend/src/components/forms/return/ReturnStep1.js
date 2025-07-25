import { Box, Button, Divider, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import { useFormModal } from "../../../context/ModalProvider";
import { useUI } from "../../../context/UIProvider";
import { FieldArray, Form, Formik } from "formik";
import { ReturnProvider } from "./ReturnProvider";
import { useReturns } from "./ReturnsProvider";

const ReturnStep1 = () => {

    // REINITIALISE FORM TO INCLUDE ALL POSSIBLE UPDATES
    const { setFormType, formRef } = useFormModal();
    const { nextStep, formData, setValuesExcel } = useReturns();
    const { handleError } = useUI();

    const validate = (values) => {
      const errors = {};

      const loanIdCounts = new Map();

      for (const ret of values.returns) {
        const id = ret.loanId;
        loanIdCounts.set(id, (loanIdCounts.get(id) || 0) + 1);
      }

      const duplicateLoanIds = new Set(
        [...loanIdCounts.entries()]
          .filter(([_, count]) => count > 1)
          .map(([id]) => id)
      );
  
      // Validate 'returns' for duplicate loanIds
      values.returns.forEach((ret, returnIndex) => {

        // BULK EXCEL LOADING
        if (ret.asset.serialNumber && !ret.loanId) {
          errors.returns = errors.returns || {};
          errors.returns[returnIndex] = {
            ...errors.returns[returnIndex],
            search: `Serial Number ${ret.asset.serialNumber} is not on loan`
          };
        } else if (ret.search && !ret.asset.serialNumber) {
          errors.returns = errors.returns || {};
          errors.returns[returnIndex] = {
            ...errors.returns[returnIndex],
            search: `Serial Number ${ret.search} was not found`
          };
        }

        // INITIAL LOADING → Loan ID found but all returned already
        if (ret.loanId && ret.asset.unreturned === 0 && ret.accessoryTypes.every(accType => accType.unreturned === 0)) {
          errors.returns = errors.returns || {};
          errors.returns[returnIndex] = {
            ...errors.returns[returnIndex],
            search: `Loan ID ${ret.loanId} has already been returned`
          };
        }

        // Check for duplicate loanIds
        if (ret.loanId && duplicateLoanIds.has(ret.loanId)) {
          errors.returns = errors.returns || {};
          errors.returns[returnIndex] = {
            ...errors.returns[returnIndex],
            search: `Duplicate Loan Found`
          };
        }

        if (ret.asset.count === 0 && ret.accessoryTypes.every(accType => accType.count === 0)) {
          errors.returns = errors.returns || {};
          errors.returns[returnIndex] = {
            ...errors.returns[returnIndex],
            search: `At least 1 item must be returned`
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
                  <ExcelFormControl loadValues={setValuesExcel} templateCols={['serialNumber', 'remarks']}/>
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
  
  export default ReturnStep1;