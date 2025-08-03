import React, { createContext, useCallback, useEffect } from 'react';
import { useContext } from 'react';
import { useFormikContext } from 'formik';
import { Button, Divider, Flex, Text } from '@chakra-ui/react';
import { LoanUser } from './LoanUser';
import { createNewUser } from './helpers';
import { AddButton } from '../utils/ItemButtons';
import { useForm } from '../../../context/FormProvider';

// Create a context for assets
const LoanContext = createContext();

// Devices Provider component
export const LoanProvider = ({user, userIndex, userHelpers, isLast}) => {
  // console.log('loan provider');
  const { values, touched } = useFormikContext();
  const { initialValues } = useForm();
  // console.log(values);

  useEffect(() => console.log(touched), [touched]);

  const removeUser = useCallback(() => userHelpers.remove(userIndex), [userHelpers, userIndex])

  return (
    <LoanContext.Provider value={{
      user, 
      userIndex, 
      userHelpers, 
      removeUser, 
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
          <Text>{`Remove ${user?.userName ? `all for ${user.userName}` : 'User'}`}</Text>
          </Button>
        )}
      </Flex>
      <Divider borderColor="black" borderWidth="2px" my={4} />
      {isLast && !Object.values(initialValues || {}).length && (
        <AddButton
          handleClick={() => userHelpers.push(createNewUser())}
          label="Add Another User"
        />
      )}
    </LoanContext.Provider>
  );
}

export const useLoan = () => useContext(LoanContext);