import React, { useState } from 'react';
import {
  Button,
  Field as ChakraField,
  Input,
  Box,
  Text,
} from '@chakra-ui/react';
import { useUI } from '../context/UIProvider';
import authService from '../services/AuthService';

const PasswordSetup = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { handleError, showToast } = useUI()

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      handleError("Passwords do not match")
      return;
    }

    setSubmitting(true);
    try {
      // Assume this function posts the data to the server
      await authService.submitPassword(password);
      showToast("Password has been successfully set up!")
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      handleError("Failed to setup password.")
    }
    setSubmitting(false);
  };

  return (
    <Box p={4} maxWidth="500px" borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <form onSubmit={handleSubmit}>
        <ChakraField label="New Password" required invalid={password !== confirmPassword}>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ChakraField>
        <ChakraField label="Confirm Password" mt={4} required invalid={password !== confirmPassword}>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {password !== confirmPassword && (
            <Text>Passwords do not match.</Text>
          )}
        </ChakraField>
        <Button mt={4} colorPalette="blue" isLoading={submitting} type="submit">
          Set Up Password
        </Button>
      </form>
    </Box>
  );
};

export default PasswordSetup;
