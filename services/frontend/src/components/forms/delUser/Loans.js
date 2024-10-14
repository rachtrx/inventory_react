import React, { useEffect, useState } from "react";
import { LoanStep2 } from "./LoanStep2";
import { LoanStep1 } from "./LoanStep1";
import { useUI } from "../../../context/UIProvider";
import assetService from "../../../services/AssetService";
import { createNewLoan } from "./Loan";
import { Box } from "@chakra-ui/react";
import { useFormModal } from "../../../context/ModalProvider";
import { LoansProvider, useLoans } from "./LoansProvider";

const Loans = () => {
  const { step } = useLoans();

  return (
    <Box>
      {/* Keep both steps mounted and control visibility */}
        
    </Box>
  );
};

export default Loans;
