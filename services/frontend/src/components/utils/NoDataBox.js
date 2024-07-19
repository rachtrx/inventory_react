import { Box, Text } from "@chakra-ui/react";

export default function NoDataBox() {
    return (
        <Box
          w="100%"
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          p={10}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.100" // Or any color you prefer
        >
          <Text fontSize="xl" color="gray.500">
            No data to show
          </Text>
        </Box>
    );
}