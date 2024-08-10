import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
} from '@chakra-ui/react';
import { useUI } from '../context/UIProvider';
import authService from '../services/AuthService';

const PasswordSetup = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError, showToast } = useUI()

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      handleError("Passwords do not match")
      return;
    }

    setIsSubmitting(true);
    try {
      // Assume this function posts the data to the server
      await authService.submitPassword(password);
      showToast("Password has been successfully set up!")
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      handleError("Failed to setup password.")
    }
    setIsSubmitting(false);
  };

  return (
    <Box p={4} maxWidth="500px" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <form onSubmit={handleSubmit}>
        <FormControl isRequired isInvalid={password !== confirmPassword}>
          <FormLabel htmlFor="password">New Password</FormLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <FormControl mt={4} isRequired isInvalid={password !== confirmPassword}>
          <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {password !== confirmPassword && (
            <FormErrorMessage>Passwords do not match.</FormErrorMessage>
          )}
        </FormControl>
        <Button mt={4} colorScheme="blue" isLoading={isSubmitting} type="submit">
          Set Up Password
        </Button>
      </form>
    </Box>
  );
};

export default PasswordSetup;
