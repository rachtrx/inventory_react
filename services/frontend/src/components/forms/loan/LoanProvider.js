import React, { createContext, useCallback } from 'react';
import { useContext } from 'react';
import { useFormikContext } from 'formik';
import { Button, Divider, Flex } from '@chakra-ui/react';
import { LoanUser } from './LoanUser';
import { createNewUser } from './helpers';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { AddButton } from '../utils/ItemButtons';
import { useFormModal } from '../../../context/ModalProvider';

// Create a context for assets
const LoanContext = createContext();

// Devices Provider component
export const LoanProvider = ({user, userIndex, userHelpers, isLast}) => {
  // console.log('loan provider');
  const { values } = useFormikContext();
  const { initialValues } = useFormModal();
  // console.log(values);

  // useEffect(() => console.log(values), [values]);

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
          <ResponsiveText>{`Remove ${user?.userName ? `all for ${user.userName}` : 'User'}`}</ResponsiveText>
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