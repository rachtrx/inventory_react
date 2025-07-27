import { createContext, useState, useCallback } from 'react';
import { useContext } from 'react';
import { useFormikContext } from 'formik';
import { Button, Divider, Flex, Text } from '@chakra-ui/react';
import { AddButton } from '../utils/ItemButtons';
import { ReturnSearch } from './ReturnSearch';
import { ManageReturn } from './ManageReturn';
import { useForm } from '../../../context/FormProvider';
import { createNewReturn } from './helpers';

// Create a context for assets
const ReturnContext = createContext();

// Devices Provider component
export const ReturnProvider = ({ret, returnIndex, returnHelpers, isLast}) => {
  // console.log('loan provider');

  const { values } = useFormikContext();
  const { initialValues } = useForm();

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
      <Text fontSize="md" fontWeight="bold" align="center">
        {`Loan #${returnIndex + 1}`}
      </Text>

      {!initialValues?.length && <ReturnSearch/>}

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
          <Text>Remove</Text>
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