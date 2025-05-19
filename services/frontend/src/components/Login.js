// https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/events.md

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import authService from '../services/AuthService';

import {
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Image,
  Center,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { ResponsiveText } from './utils/ResponsiveText';
import { useLoading } from '../context/LoadingProvider';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const { setAdmin } = useAuth();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const handleSSOLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/microsoft`; // Backend route
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true); // Assuming setLoading is defined elsewhere in your component
      const response = await authService.login(values.email, values.password);
      const validatedAdmin = response.data;
      setAdmin(validatedAdmin);
      navigate('/reminders', {replace: true});
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
          bg={useColorModeValue('white', 'gray.900')}
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
            initialValues={{
              email: "", // Changed from username to email
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <VStack spacing={5}>
                  <FormControl isRequired mt="4" mb="5" isInvalid={errors.email && touched.email} position="relative">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <Field name="email" as={Input} id="email"/>
                    <FormErrorMessage position="absolute" mt={1}>
                      <ErrorMessage name="email"/>
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired mt="4" mb="5" isInvalid={errors.password && touched.password} position="relative">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <Field name="password" as={Input} id="password" type="password"/>
                    <FormErrorMessage position="absolute" mt={1}>
                      <ErrorMessage name="password"/>
                    </FormErrorMessage>
                  </FormControl>

                  <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
          <Button colorScheme="blue" onClick={handleSSOLogin}>
            <ResponsiveText>Login with Microsoft</ResponsiveText>
          </Button>
          </Box>
      </Center>
    </Box>
  );
}