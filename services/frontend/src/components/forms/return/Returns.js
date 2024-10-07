import { Box, Flex } from "@chakra-ui/react";
import ExcelFormControl from '../utils/ExcelFormControl';
import InputFormControl from '../utils/InputFormControl';
import SelectFormControl from "../utils/SelectFormControl";
import DateInputControl from "../utils/DateInputControl";
import FormToggle from "../utils/FormToggle";
import { useFormModal } from "../../../context/ModalProvider";
import { useItems } from "../../../context/ItemsProvider";
import { SingleSelectFormControl } from "../utils/SelectFormControl";
import { useEffect, useMemo, useState } from "react";
import ReturnStep1 from "./ReturnStep1";
import { ReturnStep2 } from "./ReturnStep2";
import { useUI } from "../../../context/UIProvider";
import { createNewReturn } from "./Return";
import assetService from "../../../services/AssetService";

const Returns = () => {

  const { setLoading, showToast, handleError } = useUI();
  const { setFormType, initialValues } = useFormModal();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    returns: [createNewReturn()],
  });
  const [userReturns, setUserReturns] = useState({});

  const prevStep = () => {
    setStep(step - 1)
  };

  const fetchReturn = async (assetId) => {
    console.log(`Fetching return for: ${assetId}`);

    const returnDetails = await assetService.fetchReturn(assetId);

    console.log(`Return Details: ${returnDetails}`);

    const newReturns = {}
    const signatures = {};

    // formData.returns.forEach((ret) =>
    //   ret.users?.forEach((user) => {
    //     if (!newReturns[user.userId]) {
    //       newReturns[user.userId] = {}
    //       newReturns[user.userId].assets = [ret.asset];
    //       newReturns[user.userId].userName = user.userName;
    //       signatures[user.userId] = ''
    //       console.log(signatures);
    //     } else newReturns[user.userId].assets.push(ret.asset)
    //   })
    // );
    // setUserReturns(newReturns);
    // setFormData((prevData) => ({
    //   ...prevData,
    //   ...values,
    //   signatures: signatures,
    // }));
  };

  const handleUserData = (values, actions) => {
    // console.log('Manual Form Values:', values);
    // const userLoans = {}
    // const signatures = {};

    // values.loans.forEach((loan) =>
    //   loan.users?.forEach((user) => {
    //     if (!userLoans[user.userId]) {
    //       userLoans[user.userId] = {}
    //       userLoans[user.userId].assets = [loan.asset];
    //       userLoans[user.userId].userName = user.userName;
    //       signatures[user.userId] = ''
    //       console.log(signatures);
    //     } else userLoans[user.userId].assets.push(loan.asset)
    //   })
    // );
    // setUserLoans(userLoans);
    // setFormData((prevData) => ({
    //   ...prevData,
    //   ...values,
    //   signatures: signatures,
    // }));
    setStep(step + 1);
  };

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    console.log('Manual Form Values:', values);
    try {
      await assetService.returnAsset(values);
      actions.setSubmitting(false);
      setLoading(false);
      showToast('Assets successfully loaned', 'success', 500);
      setFormType(null);
    } catch (err) {
      console.error(err);
      handleError(err);
      console.error("Error Handled");
      setLoading(false);
    }
  };

  return (
    <Box>
      {step === 1 && <ReturnStep1 nextStep={handleUserData} formData={formData} setFormData={setFormData} fetchReturn={fetchReturn}/>}
      {step === 2 && <ReturnStep2 prevStep={prevStep} handleSubmit={handleSubmit} userReturns={userReturns} formData={formData}/>}
    </Box>
  );
};

export default Returns;