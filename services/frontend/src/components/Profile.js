import {
  Box,
  Text,
  Heading,
  VStack,
  Tag,
  Container,
	Button
} from '@chakra-ui/react';
import { ResponsiveText } from './utils/ResponsiveText';
import { useAuth } from '../context/AuthProvider';
import { useCallback, useEffect } from 'react';
import { MdLogout } from 'react-icons/md'; // react-icons
import PasswordSetup from './PasswordSetup';
import { useUI } from '../context/UIProvider';
import authService from '../services/AuthService';

const Profile = () => {

	const { admin } = useAuth();

  return (
    <Container maxW="container.md" centerContent p={4}>
      <VStack spacing={4} align="stretch">
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" w="100%">
          <Heading fontSize="xl">Profile Details</Heading>
          <Text mt={4}><b>ID:</b> {admin.id}</Text>
          <Text mt={2}><b>Name:</b> {admin.adminName}</Text>
          <Text mt={2}><b>Email:</b> {admin.email}</Text>
          <Text mt={2}><b>Authentication Types:</b> {admin.authType.map(type => <Tag key={type} ml={1}>{type}</Tag>)}</Text>
					{admin.authType.every(authType => authType === "SSO") && <PasswordSetup/>}
					<Button onClick={() => authService.logout()} leftIcon={<MdLogout />}>
						<ResponsiveText>Logout</ResponsiveText>
					</Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile;