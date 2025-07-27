import { Box, Button, Divider, ModalBody, ModalFooter } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import { useForm } from "../../../context/FormProvider";
import { useUI } from "../../../context/UIProvider";
import { FieldArray, Form, Formik } from "formik";
import { ReturnProvider } from "./ReturnProvider";
import { useReturns } from "./ReturnsProvider";
import { useStep } from "../../../context/StepProvider";
import loanService from "../../../services/LoanService";
import { createNewReturn } from "./helpers";
import { useCallback } from "react";
import { compareStrings } from "../utils/validation";

export const ReturnStep1 = () => {

    // REINITIALISE FORM TO INCLUDE ALL POSSIBLE UPDATES
    const { setFormType, formRef, reinitializeForm } = useForm();
    const { setReturnOptions, setUserOptions } = useReturns();
    const { nextStep, formData } = useStep();
    const { handleError } = useUI();
    const initialFormValues = {
      returns: [createNewReturn()],
    }

    const setValuesExcel = useCallback(async (records) => {
      // CANNOT SEARCH FOR ASSET HERE, MAYBE CAN TRY IN FUTURE TO GET THE UPDATED VALUE
      try {

        const serialNumbers = new Set();

        records.forEach(record => {
            // Trim and add asset tags to the set

          Object.keys(record).forEach(field => {
            record[field] = record[field]?.toString().trim();
          });

          ['serialNumber'].forEach(field => {
            if (!record[field]) throw new Error(`Missing ${field} at line ${record.__rowNum__}`);
          });
          
          if (serialNumbers.has(record.serialNumber)) throw new Error(`Duplicate records for serialNumber: ${record.serialNumber} were found`);
          else serialNumbers.add(record.serialNumber);
        });

        const assetResponse = await loanService.fetchAstReturn([...serialNumbers])
        console.log(assetResponse);

        const assetOptions = assetResponse.data; // gets all possible asset tags, some possibly missing
        const userOptions = assetOptions
          .filter(assetOption => assetOption.user)
          .map(assetOption => ({
            ...assetOption.user,
            value: assetOption.user.userName,
            label: assetOption.user.userName,
          })
        )

        const returns = records.map(({serialNumber, remarks}) => {
          const matchedAssetOption = assetOptions.find(option => compareStrings(option.label, serialNumber)); 
          // unlike other forms, dont need to check for isDisabled since this only fills the "search" input
          console.log(matchedAssetOption);

          return {
            loanId: matchedAssetOption?.loanId,
            astLoan: matchedAssetOption?.astLoan,
            user: matchedAssetOption?.user,
            accLoans: matchedAssetOption?.accLoans,
            remarks,
            search: serialNumber
          }
        })

        setReturnOptions(assetOptions);
        setUserOptions(userOptions); 
      
        console.log(userOptions);
      
        reinitializeForm({
          returns: returns.map(_return => createNewReturn(_return))
        });
      } catch (error) {
        handleError(error);
      }
    }, [handleError, reinitializeForm, setReturnOptions, setUserOptions]); 

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
          initialValues={initialFormValues}
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