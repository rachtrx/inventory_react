import {
  Text,
  Heading,
  VStack,
  Container,
	Button
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthProvider';
import { MdLogout } from 'react-icons/md'; // react-icons
import { eventBus } from '../config';

const Profile = () => {

	const { admin } = useAuth();

  return (
    <Container maxW="container.md" centerContent p={4}>
      <VStack spacing={4} align="stretch">
        <Heading fontSize="xl">Profile Details</Heading>
        {/* <Text mt={4}><b>ID:</b> {admin.id}</Text> */}
        <Text><b>Name:</b> {admin.adminName}</Text>
        <Text><b>Email:</b> {admin.email}</Text>
        <Button onClick={() => eventBus.emit('logout')} leftIcon={<MdLogout />}>
          <Text>Logout</Text>
        </Button>
      </VStack>
    </Container>
  );
};

export default Profile;