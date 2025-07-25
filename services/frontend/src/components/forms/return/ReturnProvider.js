import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../../../config';
import { useContext, useMemo } from 'react';
import { useUI } from '../../../context/UIProvider';
import { useFormikContext } from 'formik';
import { Box, Button, Divider, Flex, Spacer } from '@chakra-ui/react';
import { FaUser, FaUsers } from 'react-icons/fa';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { AddButton } from '../utils/ItemButtons';
import { createNewReturn, ReturnSearch } from './ReturnSearch';
import { useReturns } from './ReturnsProvider';
import { ManageReturn } from './ManageReturn';
import { useFormModal } from '../../../context/ModalProvider';

// Create a context for assets
const ReturnContext = createContext();

// Devices Provider component
export const ReturnProvider = ({ret, returnIndex, returnHelpers, isLast}) => {
  // console.log('loan provider');

  const { values } = useFormikContext();
  const { initialValues } = useFormModal();

  const [ currentLoan, setCurrentLoan ] = useState(null);
  const [ expectedReturnDate, setExpectedReturnDate ] = useState(null);

  console.log(values);

  const removeReturn = useCallback(() => returnHelpers.remove(returnIndex), [returnHelpers, returnIndex])

  return (
    <ReturnContext.Provider value={{ 
      ret, 
      returnIndex, 
      returnHelpers, 
      removeReturn,
      expectedReturnDate,
      setExpectedReturnDate,
      currentLoan,
      setCurrentLoan
    }}>
      <ResponsiveText size="md" fontWeight="bold" align="center">
        {`Loan #${returnIndex + 1}`}
      </ResponsiveText>

      <ReturnSearch/>
      {ret.loanId && (
          ret.asset.unreturned !== 0 || 
          ret.accessoryTypes.some(accType => accType.unreturned > 0) 
        ) && <ManageReturn/>}
      
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
      {isLast && !initialValues?.length ? (
        <AddButton
          handleClick={() => returnHelpers.push(createNewReturn())}
          label="Add Return"
        />
      ) : undefined}
    </ReturnContext.Provider>
  );
}

export const useReturn = () => useContext(ReturnContext);