import React from 'react';
import { Box, Button, Center, FormControl, FormLabel, Input, FormErrorMessage, VStack, useColorModeValue } from '@chakra-ui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthProvider';

export default function Register() {

	const { register } = useAuth();

  const initialValues = {
    adminName: "",
    email: "",
    password: "",
  };

  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    adminName: Yup.string()
      .required('Admin name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long')
      .required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
    	await register(values.adminName, values.email, values.password);
			navigate('/login');
			console.log('User registered:', values.adminName);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setSubmitting(false);
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
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <VStack spacing={5}>
                  <FormControl isRequired mt="4" mb="5" isInvalid={errors.adminName && touched.adminName} position="relative">
                    <FormLabel htmlFor="adminName">Admin Name</FormLabel>
                    <Field name="adminName" as={Input} id="adminName"/>
                    <FormErrorMessage position="absolute" mt={1}>
                      <ErrorMessage name="adminName"/>
                    </FormErrorMessage>
                  </FormControl>

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
                    {isSubmitting ? "Registering..." : "Register"}
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
        </Box>
      </Center>
    </Box>
  );
}
