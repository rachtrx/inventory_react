import React, { useCallback, useEffect, useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';
import { useReturn } from './ReturnProvider';
import InputFormControl from '../../utils/InputFormControl';
import { SearchSingleSelectFormControl } from '../../utils/SelectFormControl';
import { useFormModal } from '../../../../context/ModalProvider';
import { useFormikContext } from 'formik';
import { useUI } from '../../../../context/UIProvider';
import assetService from '../../../../services/AssetService';
import { createNewAccessory, createNewUsers } from './Return';
import { useReturns } from './ReturnsProvider';
import accessoryService from '../../../../services/AccessoryService';

const ReturnAccessories = () => {
  const { ret, returnIndex, setIsAstDisabled, setIsUserDisabled, isUserDisabled, isAccDisabled, setIsAccDisabled, updateUsers, setUserOptions } = useReturn();
  const [ accessoryOptions, setAccessoryOptions ] = useState([]);
  const { setFieldValue } = useFormikContext();
  const { handleError } = useUI();

  const fetchItems = useCallback(async (userId = null) => {
    try {
      const response = await accessoryService.fetchLoansForUser(userId);
      setAccessoryOptions(response.data);
    } catch (err) {
      handleError(err);
      console.error(err);
    }
  }, [handleError, setAccessoryOptions]); // Dependencies to stabilize fetchItems

  useEffect(() => {
    console.log("users change detected");
    if (!isUserDisabled && ret.users && ret.users.length === 1) {
      fetchItems(ret.users[0]?.userId);
    } else if (!ret.users || ret.users.length === 0) {
      fetchItems();
    }
  }, [ret.users, isUserDisabled, fetchItems]);

  const updateDetailsFromAccessory = async (selected) => {
    try {
      if (!selected?.loan) {
        setFieldValue(`returns.${returnIndex}.serialNumber`, '');
        setFieldValue(`returns.${returnIndex}.assetId`, '');
        setFieldValue(`returns.${returnIndex}.accessoryTypes`, []);
        setFieldValue(`returns.${returnIndex}.users`, []);
        setUserOptions([]);
        return;
      }
  
      const loan = selected.loan;

      setFieldValue(`returns.${returnIndex}.assetId`, selected?.assetId || '');
      setFieldValue(`returns.${returnIndex}.serialNumber`, selected?.serialNumber || '');

      console.log();
      updateUsers(loan.users);
      setFieldValue(`returns.${returnIndex}.users`, createNewUsers(loan.users));

      if (loan.accessoryTypes) {
        loan.accessoryTypes.forEach((accessoryType, accessoryTypeIndex) => {
          // Dynamically set the accessory data in the form
          setFieldValue(`returns.${returnIndex}.accessoryTypes.${accessoryTypeIndex}`, createNewAccessory(accessoryType));

        });
      };

      setIsUserDisabled(true);
			setIsAstDisabled(true);

    } catch (err) {
      console.error(err);
      handleError('Loan not found');
    }
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Accessory</Th>
            <Th>Count Loaned</Th>
            <Th>Return Count</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ret.accessoryTypes.map((accessoryType, accessoryIndex) => (
            <Tr key={accessoryType.key}>
              {/* accessory name */}
              <Td>{isAccDisabled ? accessoryType.accessoryName : (
                <SearchSingleSelectFormControl
                    name={`returns.${returnIndex}.accessoryTypes.${accessoryIndex}.accessoryName`}
                    updateFields={updateDetailsFromAccessory}
                    initialOptions={accessoryOptions}
                />
              )}</Td>
              
              {/* Count of accessories loaned */}
              <Td>{accessoryType.unreturned}</Td>
              
              {/* Input field for the user to enter the return count */}
              <Td>
                <InputFormControl
                    name={`returns.${returnIndex}.accessoryTypes.${accessoryIndex}.count`}
                    placeholder="Enter count"
                    max={accessoryType.unreturned}
                    min={0} 
                    disabled={accessoryType.unreturned === 0}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ReturnAccessories;