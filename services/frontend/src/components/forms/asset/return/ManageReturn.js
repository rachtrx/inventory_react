import React, { useCallback, useEffect, useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';
import { useReturn } from './ReturnProvider';
import InputFormControl from '../../utils/InputFormControl';
import { useFormikContext } from 'formik';
import { useUI } from '../../../../context/UIProvider';
import { createNewAccessory, createNewUsers } from './ReturnSearch';

export const ManageReturn = () => {
  const { ret, returnIndex } = useReturn();
  const { setFieldValue } = useFormikContext();
  const { handleError } = useUI();

  const showAsset = ret.asset.assetId
  const showAccessories = ret.accessoryTypes?.length > 0

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        {/* Conditional Headers for Asset and Accessories */}
        <Thead>
          <Tr>
            <Th colSpan={3} textAlign="center">
              {showAsset && !showAccessories ? "Assets" : null}
              {!showAsset && showAccessories ? "Accessories" : null}
              {showAsset && showAccessories ? "Assets & Accessories" : null}
            </Th>
          </Tr>
          <Tr>
            <Th>Items</Th>
            <Th>Count Loaned</Th>
            <Th>Return Count</Th>
          </Tr>
        </Thead>

        {/* Conditional Bodies for Asset and Accessories */}
        <Tbody>
          {showAsset &&
            (
              <Tr key={ret.asset.assetId}>
                <Td>{ret.asset.serialNumber}</Td>
                <Td>1</Td>
                <Td>
                  <InputFormControl
                    name={`returns.${returnIndex}.asset.count`}
                    placeholder="Enter count"
                    max={ret.assetId ? 0 : 1}
                    min={0}
                    disabled={ret.asset.returnEventId}
                  />
                </Td>
              </Tr>
            )}

          {showAccessories &&
            ret.accessoryTypes?.map((accessoryType, accessoryIndex) => (
              <Tr key={accessoryType.accessoryTypeId}>
                <Td>{accessoryType.accessoryName}</Td>
                <Td>{accessoryType.unreturned}</Td>
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

// useEffect(() => {
//   console.log("users change detected");
//   if (!isUserDisabled && ret.users && ret.users.length === 1) {
//     fetchItems(ret.users[0]?.userId);
//   } else if (!ret.users || ret.users.length === 0) {
//     fetchItems();
//   }
// }, [ret.users, isUserDisabled, fetchItems]);

// const fetchItems = useCallback(async (userId = null) => {
//   try {
//     const response = await accessoryService.fetchLoansForUser(userId);
//     setAccessoryOptions(response.data);
//   } catch (err) {
//     handleError(err);
//     console.error(err);
//   }
// }, [handleError, setAccessoryOptions]); // Dependencies to stabilize fetchItems