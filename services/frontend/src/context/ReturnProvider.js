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
import { Return } from '../components/forms/return/Return';

// Create a context for assets
const ReturnContext = createContext();

// Devices Provider component
export const ReturnProvider = ({ret, returnIndex, returnHelpers, assetOption}) => {
  // console.log('loan provider');

  const { values, setFieldValue } = useFormikContext();

  console.log(values);

  const removeReturn = useCallback(() => returnHelpers.remove(returnIndex), [returnHelpers, returnIndex])

  return (
    <ReturnContext.Provider value={{ ret, returnIndex, returnHelpers, removeReturn, assetOption }}>
      <ResponsiveText size="md" fontWeight="bold" align="center">
        {`Asset #${returnIndex + 1}`}
      </ResponsiveText>

      <Return />
      
      <Flex mt={2} gap={4} justifyContent="space-between">
        {values.returns.length > 1 && (
          <Button
            type="button"
            onClick={() => removeReturn()}
            alignSelf="flex-start"
            colorScheme="red"
          >
          <ResponsiveText>Remove</ResponsiveText>
          </Button>
        )}
      </Flex>
      <Divider borderColor="black" borderWidth="2px" my={4} />
    </ReturnContext.Provider>
  );
}

export const useReturn = () => useContext(ReturnContext);