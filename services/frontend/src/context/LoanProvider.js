import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../config';
import { useContext, useMemo } from 'react';
import { useUI } from './UIProvider';

// Create a context for assets
const LoanContext = createContext();

// Devices Provider component
export const LoanProvider = ({children, loan, loanIndex, loanHelpers, errors, loanCount}) => {
  const [ mode, setMode ] = useState(null);

  return (
    <LoanContext.Provider value={{ mode, setMode, loan, loanIndex, loanHelpers, errors, loanCount }}>
      {children}
    </LoanContext.Provider>
  );
}

export const useLoan = () => useContext(LoanContext);