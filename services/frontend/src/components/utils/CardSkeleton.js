import React, { useState, useEffect } from "react";
import { VStack, Box, Skeleton, Table, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";

export default function CardSkeleton() {
  const [rows, setRows] = useState(10); // Default rows
  const [columns, setColumns] = useState(5); // Default columns

  useEffect(() => {
    const updateTableSize = () => {
      const rowHeight = 50; // Estimated height per row (adjust as needed)
      const availableHeight = window.innerHeight - 100; // Adjust for padding/header
      
      const colWidth = 150; // Estimated width per column
      const availableWidth = window.innerWidth - 50; // Adjust for margins
      
      setRows(Math.floor(availableHeight / rowHeight));
      setColumns(Math.floor(availableWidth / colWidth));
    };

    updateTableSize(); // Initial calculation
    window.addEventListener("resize", updateTableSize); // Listen for window resize

    return () => window.removeEventListener("resize", updateTableSize); // Cleanup
  }, []);

  return (
    <VStack spacing={6} w="100%" p={4}>
      <Box w="100%" overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              {[...Array(columns)].map((_, index) => (
                <Th key={index}>
                  <Skeleton h="20px" w="80%" borderRadius="md" />
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <Tr key={rowIndex}>
                {[...Array(columns)].map((_, colIndex) => (
                  <Td key={colIndex}>
                    <Skeleton h="16px" w="90%" borderRadius="md" />
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
}
