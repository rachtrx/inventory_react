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

  /*
    ^(?=.*[a-z])       # At least one lowercase letter
    (?=.*[A-Z])        # At least one uppercase letter
    (?=.*\d)           # At least one number
    (?=.*[@$!%*?&])    # At least one special character
    [A-Za-z\d@$!%*?&]  # Allow only letters, numbers, and special characters
    {8,}               # Minimum length of 8 characters
    $                  # End of the string
  */
  const validatePassword = (password, confirmPassword) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // Check if passwords match
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    // Check if password meets requirements
    if (!passwordRegex.test(password)) {
      throw new Error("Failed to setup password: Must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      validatePassword(password, confirmPassword);
      await authService.submitPassword(password);
      showToast("Password has been successfully set up!", "success", 500)
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      handleError(error)
    }
    setIsSubmitting(false);
  };

  return (
    <Box p={4}>
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
