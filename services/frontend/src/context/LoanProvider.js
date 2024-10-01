import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../config';
import { useContext, useMemo } from 'react';
import { useUI } from './UIProvider';
import { useFormikContext } from 'formik';
import { Box, Button, Divider, Flex, Spacer } from '@chakra-ui/react';
import { createNewLoan, Loan, LoanType } from '../components/forms/loan/Loan';
import { FaUser, FaUsers } from 'react-icons/fa';
import { ResponsiveText } from '../components/utils/ResponsiveText';
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
  // console.log('loan provider');
  const [ mode, setMode ] = useState(null);
  const { values, setFieldValue } = useFormikContext();

  console.log(values);

  useEffect(() => {
    setFieldValue(`loans.${loanIndex}.mode`, mode);
  }, [mode, setFieldValue, loanIndex])

  useEffect(() => {
    const noAsset = loan.asset.assetId === '';
    if (noAsset && loan.users.length === 1) setMode('');
    else if (!loan.asset.shared) setMode(LoanType.SINGLE);
    else setMode(LoanType.SHARED);
	}, [loan, setMode])

  const removeLoan = useCallback(() => loanHelpers.remove(loanIndex), [loanHelpers, loanIndex])

  return (
    <LoanContext.Provider value={{ mode, setMode, loan, loanIndex, loanHelpers, removeLoan, warnings }}>
      {mode && <LoanMode mode={mode}/>}
      <ResponsiveText size="md" fontWeight="bold" align="center">
        {`Asset #${loanIndex + 1}`}
      </ResponsiveText>

      <Loan />
      
      <Flex mt={2} gap={4} justifyContent="space-between">
        {values.loans.length > 1 && (
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
          label="Add Asset"
        />
      )}
    </LoanContext.Provider>
  );
}

export const useLoan = () => useContext(LoanContext);