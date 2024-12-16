import React from 'react';
import { Box, Button, Center, Field as ChakraField, Input, Text, VStack } from '@chakra-ui/react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthProvider';
import { useTheme } from "next-themes";

export default function Register() {

  const { theme } = useTheme();
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
          bg={theme === "dark" ? "gray.900" : "white"}
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
                <VStack gap={5}>
                  <ChakraField label="Admin Name" required mt="4" mb="5" invalid={errors.adminName && touched.adminName} position="relative" errorText={touched.adminName && errors.adminName}>
                    <Field name="adminName" as={Input} id="adminName"/>
                  </ChakraField>

                  <ChakraField label="Email" required mt="4" mb="5" invalid={errors.email && touched.email} position="relative" errorText={touched.email && errors.email}>
                    <Field name="email" as={Input} id="email"/>
                  </ChakraField>

                  <ChakraField label="Password" required mt="4" mb="5" invalid={errors.password && touched.password} position="relative" errorText={touched.password && errors.password}>
                    <Field name="password" as={Input} id="password" type="password"/>
                  </ChakraField>

                  <Button colorPalette="blue" type="submit" isLoading={isSubmitting}>
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
