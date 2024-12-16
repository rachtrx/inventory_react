import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";
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
          {ret.accessoryTypes.map((accessoryType, accessoryIndex) => (
            <Tr key={accessoryType.key}>
              {/* accessory name */}
              <Td>{accessoryType.accessoryName}</Td>
              
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