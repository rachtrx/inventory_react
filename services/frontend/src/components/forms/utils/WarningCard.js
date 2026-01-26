import { Box, Text, Button, VStack, SimpleGrid } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";

const WarningCard = ({ message, items, itemAttr, onCreate }) => {
  return (
    <Box
      bg="bgRed"
      border="1px solid"
      borderColor="red.300"
      borderRadius="md"
      p={4}
      width="100%"
      boxShadow="md"
      zIndex={1}
    >
      <VStack spacing={3} align="center">
        <WarningIcon boxSize={6} color="red.500" />
        <Text fontSize="md" fontWeight="semibold" color="textRed">
          {message || "This item does not exist."}
        </Text>
        <SimpleGrid columns={4} spacing={2} overflowY="auto" align="center">
            {items.map((item, index) => (
                <Text key={index} fontSize="xs" color="textRed">
                  {item[itemAttr]}
                </Text>
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
