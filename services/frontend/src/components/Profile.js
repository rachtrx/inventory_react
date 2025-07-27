import {
  Box,
  Text,
  Heading,
  VStack,
  Tag,
  Container,
	Button
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthProvider';
import { MdLogout } from 'react-icons/md'; // react-icons
import PasswordSetup from './PasswordSetup';
import { eventBus } from '../config';

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
					<Button onClick={() => eventBus.emit('logout')} leftIcon={<MdLogout />}>
						<Text>Logout</Text>
					</Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile;