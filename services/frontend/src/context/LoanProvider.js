import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../config';
import { useContext, useMemo } from 'react';
import { useUI } from './UIProvider';
import { useFormikContext } from 'formik';
import { Box, Button, Divider, Flex, Spacer } from '@chakra-ui/react';
import { createNewLoan, Loan, LoanType } from '../components/forms/Loan';
import { FaUser, FaUsers } from 'react-icons/fa';
import { ResponsiveText } from '../components/utils/ResponsiveText';
import { LoanSummary } from '../components/forms/utils/LoanSummary';
import { AddButton } from '../components/forms/utils/ItemButtons';

const LoanMode = ({ mode }) => {
  return (
    <Flex direction="row" alignItems="center" position='absolute' right='1'>
      <Flex
        p={1}
        gap={1}
        borderRadius="md"
        bg="teal.500"
        color="white"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box as="span" fontSize="xs">
          {mode === LoanType.SHARED ? <FaUsers size="10px" /> : <FaUser size="10px" />}
        </Box>
        <ResponsiveText fontSize="xs">{mode} MODE</ResponsiveText>
      </Flex>
    </Flex>
  );
};

// Create a context for assets
const LoanContext = createContext();

// Devices Provider component
export const LoanProvider = ({loan, loanIndex, loanHelpers, warnings, isLast}) => {
  const [ mode, setMode ] = useState(null);
  const [ saved, setSaved ] = useState(false);
  const { values, errors, setFieldValue } = useFormikContext();

  // console.log('loan provider');

  useEffect(() => {
    console.log(`Loan ${loanIndex}: ${saved}`);
  }, [saved, loanIndex]);

  useEffect(() => {
    setFieldValue(`loans.${loanIndex}.saved`, saved ? true : false);
  }, [saved, setFieldValue, loanIndex]);

  const removeLoan = useCallback(() => loanHelpers.remove(loanIndex), [loanHelpers, loanIndex])

  return (
    <LoanContext.Provider value={{ mode, setMode, saved, setSaved, loan, loanIndex, loanHelpers, removeLoan }}>
      {mode && <LoanMode mode={mode}/>}
      <ResponsiveText size="md" fontWeight="bold" align="center">
        {`Loan #${loanIndex + 1}`}
      </ResponsiveText>

      <Box style={{ display: saved ? 'block' : 'none' }}>
        <LoanSummary
          loan={loan}
          handleRemove={removeLoan}
          isOnlyLoan={values.loans.length === 1}
        />
      </Box>
      <Box style={{ display: !saved ? 'block' : 'none' }}>
        <Loan />
      </Box>
      
      <Flex mt={2} gap={4} justifyContent="space-between">
        {!saved && (
          <>
            <Spacer />
            <Button
              onClick={() => setSaved(true)}
              colorScheme="green"
              isDisabled={errors.loans?.[loanIndex]}
              alignSelf="flex-end"
            >
              Save
            </Button>
          </>
        )}
        {values.loans.length > 1 && !saved && (
          <Button
          type="button"
          onClick={() => removeLoan()}
          alignSelf="flex-start"
          colorScheme="red"
          >
          <ResponsiveText>Remove</ResponsiveText>
          </Button>
        )}
      </Flex>
      <Divider borderColor="black" borderWidth="2px" my={4} />
      {isLast && (
        <AddButton
          handleClick={() => loanHelpers.push(createNewLoan())}
          label="Add Loan"
        />
      )}
    </LoanContext.Provider>
  );
}

export const useLoan = () => useContext(LoanContext);