import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../../../../config';
import { useContext, useMemo } from 'react';
import { useUI } from '../../../../context/UIProvider';
import { useFormikContext } from 'formik';
import { Box, Button, Divider, Flex, HStack, Spacer, Switch, VStack } from '@chakra-ui/react';
import { createNewAccessory, createNewAsset, createNewLoan, Loan, LoanType } from './Loan';
import { FaUser, FaUsers } from 'react-icons/fa';
import { ResponsiveText } from '../../../utils/ResponsiveText';
import { AddButton } from '../../utils/ItemButtons';
import ThreeWaySwitch from '../../utils/ThreeWaySwitch';
import { useFormModal } from '../../../../context/ModalProvider';

const loanType = {
  ASSET: "ASSET",
  BOTH: "BOTH",
  ACCESSORY: "ACCESSORY"
}

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

  const [ hasAcc, setHasAcc ] = useState(!!(loan.accessories && loan.accessories.length > 0));
  const [ hasAst, setHasAst ] = useState(!!loan.asset?.serialNumber || !hasAcc);

  console.log(values);

  useEffect(() => {
    setFieldValue(`loans.${loanIndex}.mode`, mode);
  }, [mode, setFieldValue, loanIndex])

  useEffect(() => {
    const noAsset = loan.asset.assetId === '';
    if (noAsset && loan.users.length === 1) setMode('');
    else if (noAsset && loan.users.length > 1) setMode(LoanType.SHARED);
    else if (!loan.asset.shared) setMode(LoanType.SINGLE);
    else setMode(LoanType.SHARED);
	}, [loan, setMode])

  const removeLoan = useCallback(() => loanHelpers.remove(loanIndex), [loanHelpers, loanIndex])

  const handleSwitchChange = (value) => {
    if(value === loanType.ASSET || value === loanType.BOTH) {
      if (!values.loans[loanIndex].asset) setFieldValue(`loans.${loanIndex}.asset`, createNewAsset())
      setHasAst(true)
    } else {
      setFieldValue(`loans.${loanIndex}.asset`, createNewAsset());
      setHasAst(false)
    }
    
    if(value === loanType.ACCESSORY || value === loanType.BOTH) {
      if (values.loans[loanIndex].accessories.length === 0) setFieldValue(`loans.${loanIndex}.accessories`, [createNewAccessory()]);
      setHasAcc(true)
    } else {
      setFieldValue(`loans.${loanIndex}.accessories`, []);
      setHasAcc(false)
    }
  }

  return (
    <LoanContext.Provider value={{ 
      mode, 
      setMode,
      hasAst,
      hasAcc,
      loan, 
      loanIndex, 
      loanHelpers, 
      removeLoan, 
      warnings 
    }}>
      {mode && <LoanMode mode={mode}/>}
      <HStack>
        <ResponsiveText size="md" fontWeight="bold" align="center">
          {`Loan #${loanIndex + 1}`}
        </ResponsiveText>
        <ThreeWaySwitch options={Object.values(loanType)} onChange={handleSwitchChange} />
      </HStack>

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
          label="Add Another Loan"
        />
      )}
    </LoanContext.Provider>
  );
}

export const useLoan = () => useContext(LoanContext);