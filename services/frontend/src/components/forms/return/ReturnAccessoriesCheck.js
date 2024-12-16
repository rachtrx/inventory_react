import React, { useState } from 'react';
import { Checkbox, Box } from '@chakra-ui/react';
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/table";

const ReturnAccessories = () => {
  const [masterChecked, setMasterChecked] = useState(false);
  const [rowChecked, setRowChecked] = useState([false, false, false, false]); // Example for 4 rows

  // Handle master checkbox toggle
  const handleMasterCheck = (e) => {
    const isChecked = e.target.checked;
    setMasterChecked(isChecked);
    setRowChecked(rowChecked.map(() => isChecked)); // Check/uncheck all rows
  };

  // Handle individual row checkbox toggle
  const handleRowCheck = (index) => (e) => {
    const isChecked = e.target.checked;
    const newRowChecked = [...rowChecked];
    newRowChecked[index] = isChecked;
    setRowChecked(newRowChecked);

    // If all checkboxes are checked, check the master checkbox, otherwise uncheck it
    setMasterChecked(newRowChecked.every(Boolean));
  };

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            {/* Master Checkbox */}
            <Th>
              <Checkbox 
                isChecked={masterChecked} 
                onChange={handleMasterCheck}
              />
            </Th>
            <Th>Index</Th>
            <Th>Data 1</Th>
            <Th>Data 2</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rowChecked.map((isChecked, index) => (
            <Tr key={index}>
              {/* Individual row checkbox */}
              <Td>
                <Checkbox 
                  isChecked={isChecked} 
                  onChange={handleRowCheck(index)}
                />
              </Td>
              <Td>{index + 1}</Td>
              <Td>Row {index + 1} - Data 1</Td>
              <Td>Row {index + 1} - Data 2</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ReturnAccessories;