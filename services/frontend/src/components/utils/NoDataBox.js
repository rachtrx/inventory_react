import { Box, Text, useColorModeValue } from "@chakra-ui/react";

export default function NoDataBox({ message = "No data found" }) {
  const bg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      w="100%"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      p={10}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bg}
    >
      <Text fontSize="lg" color={textColor}>
        {message}
      </Text>
    </Box>
  );
}
