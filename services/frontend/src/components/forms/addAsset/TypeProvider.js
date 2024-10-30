import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../../../config';
import { useContext, useMemo } from 'react';
import { useUI } from '../../../context/UIProvider';
import { useFormikContext } from 'formik';
import { Box, Button, Divider, Flex, Spacer } from '@chakra-ui/react';
import { createNewLoan, Loan, LoanType } from './AddSubType';
import { FaUser, FaUsers } from 'react-icons/fa';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { AddButton } from '../utils/ItemButtons';

// Create a context for assets
const TypeContext = createContext();

// Devices Provider component
export const TypeProvider = ({type, typeIndex, typeHelpers, isLast}) => {
  // console.log('loan provider');
  const { values, setFieldValue } = useFormikContext();

  const removeType = useCallback(() => typeHelpers.remove(typeIndex), [typeHelpers, typeIndex])

  return (
    <TypeContext.Provider value={{ type, typeIndex, typeHelpers, removeType }}>
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
    </TypeContext.Provider>
  );
}

export const useType = () => useContext(TypeContext);