import React, { useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';
import { useReturn } from '../../../context/ReturnProvider';
import InputFormControl from '../utils/InputFormControl';

const ReturnPeripherals = () => {
    const { ret, returnIndex } = useReturn();

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Peripheral Name</Th>
            <Th>Count Loaned</Th>
            <Th>Return Count</Th>
          </Tr>
        </Thead>
        <Tbody>
          {ret.peripherals.map((peripheral, peripheralIndex) => (
            <Tr key={peripheral.id}>
              {/* Peripheral name */}
              <Td>{peripheral.peripheralName}</Td>
              
              {/* Count of peripherals loaned */}
              <Td>{peripheral.ids.length}</Td>
              
              {/* Input field for the user to enter the return count */}
              <Td>
                <InputFormControl
                    name={`returns.${returnIndex}.peripherals.${peripheralIndex}.count`}
                    placeholder="Enter count"
                    max={peripheral.ids.length}
                    min={0} 
                    disabled={peripheral.count === 0}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ReturnPeripherals;