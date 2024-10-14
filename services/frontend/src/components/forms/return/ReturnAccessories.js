import React, { useEffect, useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';
import { useReturn } from './ReturnProvider';
import InputFormControl from '../utils/InputFormControl';

const ReturnAccessories = () => {
    const { ret, returnIndex } = useReturn();

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
          {ret.accessories.map((accessory, accessoryIndex) => (
            <Tr key={accessory.key}>
              {/* accessory name */}
              <Td>{accessory.accessoryName}</Td>
              
              {/* Count of accessories loaned */}
              <Td>{accessory.accessoryIds.length}</Td>
              
              {/* Input field for the user to enter the return count */}
              <Td>
                <InputFormControl
                    name={`returns.${returnIndex}.accessories.${accessoryIndex}.count`}
                    placeholder="Enter count"
                    max={accessory.accessoryIds.length}
                    min={0} 
                    disabled={accessory.accessoryIds.length === 0}
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