import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../../../../config';
import { useContext, useMemo } from 'react';
import { useUI } from '../../../../context/UIProvider';
import { useFormikContext } from 'formik';
import { Box, Button, Divider, Flex, Spacer } from '@chakra-ui/react';
import { FaUser, FaUsers } from 'react-icons/fa';
import { ResponsiveText } from '../../../utils/ResponsiveText';
import { AddButton } from '../../utils/ItemButtons';
import { createNewReturn, Return } from './Return';
import { useReturns } from './ReturnsProvider';

// Create a context for assets
const ReturnContext = createContext();

// Devices Provider component
export const ReturnProvider = ({ret, returnIndex, returnHelpers, isLast}) => {
  // console.log('loan provider');

  const { setUserOptions } = useReturns();
  const { values, setFieldValue } = useFormikContext();

  const [ isAstDisabled, setIsAstDisabled ] = useState(values.returns[returnIndex].assetId || false);
  const [ isUserDisabled, setIsUserDisabled ] = useState(values.returns[returnIndex].users?.length > 0 || false)
  const [ isAccDisabled, setIsAccDisabled ] = useState(values.returns[returnIndex].accessoryTypes?.length > 0 || false)

  console.log(values);

  const removeReturn = useCallback(() => returnHelpers.remove(returnIndex), [returnHelpers, returnIndex])

  const updateUsers = (users) => {
		const newUserOptions = users.map(user => {
			return {
				value: user.userName,
				label: user.userName
			}
		})

		console.log(newUserOptions);

		setUserOptions(newUserOptions)
		setFieldValue(
			`returns.${returnIndex}.users`,
			{
				userNames: users.map(user => user.userName),
				userIds: users.map(user => user.userId || user.userId),
			}
		)
	}

  return (
    <ReturnContext.Provider value={{ 
      ret, 
      returnIndex, 
      returnHelpers, 
      removeReturn,
    }}>
      <ResponsiveText size="md" fontWeight="bold" align="center">
        {`Loan #${returnIndex + 1}`}
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
      {isLast && (
        <AddButton
          handleClick={() => returnHelpers.push(createNewReturn())}
          label="Add Return"
        />
      )}
    </ReturnContext.Provider>
  );
}

export const useReturn = () => useContext(ReturnContext);