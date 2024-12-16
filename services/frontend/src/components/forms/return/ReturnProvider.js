import React, { createContext, useState, useEffect, useCallback } from 'react';
import { dateTimeObject } from '../../../config';
import { useContext, useMemo } from 'react';
import { useUI } from '../../../context/UIProvider';
import { useFormikContext } from 'formik';
import { Box, Button, Separator, Flex, Spacer } from '@chakra-ui/react';
import { FaUser, FaUsers } from 'react-icons/fa';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { AddButton } from '../utils/ItemButtons';
import { createNewReturn, Return } from './Return';

// Create a context for assets
const ReturnContext = createContext();

// Devices Provider component
export const ReturnProvider = ({ret, returnIndex, returnHelpers, isLast}) => {
  // console.log('loan provider');

  const { values, setFieldValue } = useFormikContext();

  console.log(values);

  const removeReturn = useCallback(() => returnHelpers.remove(returnIndex), [returnHelpers, returnIndex])

  return (
    <ReturnContext.Provider value={{ ret, returnIndex, returnHelpers, removeReturn }}>
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
            colorPalette="red"
          >
          <ResponsiveText>Remove</ResponsiveText>
          </Button>
        )}
      </Flex>
      <Separator borderColor="black" borderWidth="2px" my={4} />
      {isLast && (
        <AddButton
          handleClick={() => returnHelpers.push(createNewReturn())}
          label="Add Asset"
        />
      )}
    </ReturnContext.Provider>
  );
}

export const useReturn = () => useContext(ReturnContext);