// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/events.md

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import authService from '../services/AuthService';

import {
  Box,
  Button,
  Image,
  Center,
  useColorModeValue,
  VStack,
  Text,
  Badge
} from '@chakra-ui/react';

export default function Login() {

  const handleSSOLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/microsoft`; // Backend route
  };

  return (
    <Center p={2} flex="1">
      <VStack spacing={5}>
        <Box mb={4}>
          <Image
            src="gos.png"
            alt="Profile image"
            h="20vh"
          />
        </Box>
        <Button
          colorScheme="blue"
          onClick={handleSSOLogin}
          bgGradient="linear(to-r, blue.500, blue.600)"
          color="white"
          fontWeight="semibold"
          letterSpacing="wide"
          size="lg"
          px={8}
          py={6}
          borderRadius="xl"
          transition="all 0.2s ease-in-out"
          _hover={{
            transform: "scale(1.05)",
            boxShadow: "lg",
            bgGradient: "linear(to-r, blue.600, blue.700)",
          }}
          _active={{
            transform: "scale(0.98)",
            boxShadow: "sm",
          }}
        >
          <Text>LOGIN TO ICT INVENTORY</Text>
        </Button>
      </VStack>
    </Center>
  );
}