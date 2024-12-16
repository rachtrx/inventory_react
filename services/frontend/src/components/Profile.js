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
import { useCallback } from 'react';
import authService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { MdLogout } from 'react-icons/md'; // react-icons
import PasswordSetup from './PasswordSetup';

const Profile = () => {

	const { admin, setAdmin } = useAuth();
	const navigate = useNavigate();

  const logout = useCallback(async () => {
    console.log(`Logging out ${admin}!`);

    try {
      await authService.logout();
      if (admin) setAdmin(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }, [navigate, admin, setAdmin]);

  return (
    <Container maxW="container.md" centerContent p={4}>
      <VStack gap={4} align="stretch">
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" w="100%">
          <Heading fontSize="xl">Profile Details</Heading>
          <Text mt={4}><b>ID:</b> {admin.id}</Text>
          <Text mt={2}><b>Name:</b> {admin.adminName}</Text>
          <Text mt={2}><b>Email:</b> {admin.email}</Text>
          <Text mt={2}><b>Authentication Types:</b> {admin.authType.map(type => <Tag key={type} ml={1}>{type}</Tag>)}</Text>
					<PasswordSetup/>
					<Button onClick={logout} leftIcon={<MdLogout />}>
						<ResponsiveText>Logout</ResponsiveText>
					</Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile;