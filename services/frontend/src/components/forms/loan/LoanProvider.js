import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../../../config';
import { useContext, useMemo } from 'react';
import { useUI } from '../../../context/UIProvider';
import { useFormikContext } from 'formik';
import { Box, Button, Checkbox, Divider, Flex, FormControl, FormLabel, HStack, Spacer, Switch, VStack } from '@chakra-ui/react';
import { createNewAccessory, createNewAsset, createNewLoan, createNewUser, LoanUser } from './LoanUser';
import { FaUser, FaUsers } from 'react-icons/fa';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { AddButton } from '../utils/ItemButtons';
import ThreeWaySwitch from '../utils/ThreeWaySwitch';
import { useFormModal } from '../../../context/ModalProvider';

// Create a context for assets
const LoanContext = createContext();

// Devices Provider component
export const LoanProvider = ({user, userIndex, userHelpers, warnings, isLast}) => {
  // console.log('loan provider');
  const { values, setFieldValue } = useFormikContext();
  // console.log(values);

  useEffect(() => console.log(values), [values]);

  const removeUser = useCallback(() => userHelpers.remove(userIndex), [userHelpers, userIndex])

  return (
    <LoanContext.Provider value={{
      user, 
      userIndex, 
      userHelpers, 
      removeUser, 
      warnings 
    }}>
      <LoanUser />
      
      <Flex mt={2} gap={4} justifyContent="space-between">
        {values.users.length > 1 && (
          <Button
            type="button"
            onClick={() => removeUser()}
            alignSelf="flex-start"
            colorScheme="red"
          >
          <ResponsiveText>{`Remove ${user?.userName ? `all for ${user.userName}` : 'User'}`}</ResponsiveText>
          </Button>
        )}
      </Flex>
      <Divider borderColor="black" borderWidth="2px" my={4} />
      {isLast && (
        <AddButton
          handleClick={() => userHelpers.push(createNewUser())}
          label="Add Another User"
        />
      )}
    </LoanContext.Provider>
  );
}

export const useLoan = () => useContext(LoanContext);