// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/events.md

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import authService from '../services/AuthService';
import { useTheme } from 'next-themes';

import {
  Box,
  Field as ChakraField,
  Input,
  Button,
  Image,
  Center,
  VStack,
  Text
} from '@chakra-ui/react';
import { useUI } from '../context/UIProvider';
import { ResponsiveText } from './utils/ResponsiveText';
import { useMsal } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';

const validationSchema = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const { admin, setAdmin } = useAuth();
  const { loading, setLoading, handleError } = useUI()
  const navigate = useNavigate()
  const theme = useTheme();

  const { instance, accounts } = useMsal();

  useEffect(() => {
    const callbackId = instance.addEventCallback(async (message) => {
        if (message.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
            console.log('Token acquired successfully', message.payload);
            const tokenResponse = message.payload;
            try {
                console.log("Calling MS Graph with access token", tokenResponse.accessToken);
                const profile = await authService.callMsGraph(tokenResponse.accessToken);
                console.log("MS Graph profile", profile);
                const response = await authService.loginSSO(profile);
                console.log("User Data", response.data);
                setAdmin(response.data);
            } catch (error) {
                console.error("Error during token acquisition or profile fetching:", error);
                handleError("Error during token acquisition or profile fetching");
            }
        } else if (message.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
            console.error("Failed to acquire token", message.error);
            handleError("Failed to acquire token");
        }
    });

    if (accounts && accounts.length > 0) {
      instance.setActiveAccount(accounts[0]); // FOR 2FA
    }

    // Cleanup the callback when the component unmounts
    return () => {
        if (callbackId) {
            instance.removeEventCallback(callbackId);
        }
    };
  }, [navigate]);

  const handleSSOLogin = async () => {
    try {
        await instance.loginPopup(loginRequest);
    } catch (error) {
        console.error('Failed to login:', error);
        handleError("SSO login error");
    }
  };

  useEffect(() => {
    console.log("Admin changed: ", admin);
    if (admin && admin.canSetupPassword) {
      navigate('/profile', { replace: true });
    } else if (admin) {
      navigate('/dashboard', { replace: true });
    }
  }, [admin]);

  useEffect(() => {
    const performCheck = async () => {
      if (!admin) {
        try {
          const response = await authService.checkAuth();
          setAdmin(response.data);
        } catch (error) {
          console.error('Failed to check authentication:', error);
        }
      }
    };
  
    performCheck();
  }, [admin]);

  const initialValues = {
    email: "", // Changed from username to email
    password: "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true); // Assuming setLoading is defined elsewhere in your component
      console.log('Attempting to login with:', values.email);
      const response = await authService.login(values.email, values.password);
      setAdmin(response.data);
    } catch (err) {
      console.error('Login failed:', err.response ? err.response.data : err);
    } finally {
      setSubmitting(false);
      setLoading(false); // Ensure this doesn't cause an additional rerender if it's not necessary
    }
  };

  return (
    <Box className="col-md-12">
      <Center py={12}>
        <Box
          maxW={'40vw'}
          w={'full'}
          bg={theme === "dark" ? "gray.800" : "white"}
          boxShadow={'2xl'}
          rounded={'lg'}
          p={6}
          textAlign={'center'}
        >
          <Box mb={4} display={'flex'} justifyContent={'center'}>
            <Image
              borderRadius={'full'}
              boxSize={'100px'}
              src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
              alt="Profile image"
            />
          </Box>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <VStack gap={5}>
                  <ChakraField label="Email" required mt="4" mb="5" invalid={errors.email && touched.email} position="relative">
                    <Field name="email" as={Input} id="email"/>
                    <Text position="absolute" mt={1}>
                      <ErrorMessage name="email"/>
                    </Text>
                  </ChakraField>

                  <ChakraField label="Password" required mt="4" mb="5" invalid={errors.password && touched.password} position="relative">
                    <Field name="password" as={Input} id="password" type="password"/>
                    <Text position="absolute" mt={1}>
                      <ErrorMessage name="password"/>
                    </Text>
                  </ChakraField>

                  <Button colorPalette="blue" type="submit" isLoading={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
          <Button colorPalette="blue" onClick={handleSSOLogin}>
            <ResponsiveText>Login with Azure</ResponsiveText>
          </Button>
          </Box>
      </Center>
    </Box>
  );
}