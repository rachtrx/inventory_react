import { Box, Text, Flex, Link } from "@chakra-ui/react";

export const Footer = () => {
  return (
    <Box as="footer" bg="subtle" py={4} mt="auto" w="full">
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" px={6}>
        <Text fontSize="sm" color="gray">
          © {new Date().getFullYear()} ICT Inventory by Rachmiel Teo. All rights reserved.
        </Text>
        <Flex gap={4} mt={{ base: 2, md: 0 }}>
          {/* <Link href="/privacy" fontSize="sm" color="blue.500">Privacy Policy</Link>
          <Link href="/terms" fontSize="sm" color="blue.500">Terms of Use</Link> */}
          <Link href="mailto:rachmielteorenxiang@gmail.com" fontSize="sm" color="gray">Report Fault</Link>
        </Flex>
      </Flex>
    </Box>
  );
};
