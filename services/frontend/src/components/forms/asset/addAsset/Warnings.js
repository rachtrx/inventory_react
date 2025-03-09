import { Box, Text, Button, VStack, SimpleGrid } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import React from "react";
import { ResponsiveText } from "../../../utils/ResponsiveText";

const WarningCard = ({ message, items, itemAttr, onCreate }) => {
  return (
    <Box
      bg="red.50" // Pale red background
      border="1px solid"
      borderColor="red.300"
      borderRadius="md"
      p={4}
      width="100%"
      boxShadow="md"
    >
      <VStack spacing={3} align="center">
        <WarningIcon boxSize={6} color="red.500" />
        <Text fontSize="md" fontWeight="semibold" color="red.700">
          {message || "This item does not exist."}
        </Text>
        <SimpleGrid columns={4} spacing={2} overflowY="auto">
            {items.map((item, index) => (
                <ResponsiveText key={index} size="xs">
                {item[itemAttr]}
                </ResponsiveText>
            ))}
        </SimpleGrid>
        <Button colorScheme="red" onClick={onCreate}>
          Create
        </Button>
      </VStack>
    </Box>
  );
};

export default WarningCard;
