import { Box, Heading, Text, Button, Flex, Link, IconButton, useDisclosure } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, CheckIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { eventToStatus } from '../../config';
import { useDrawer } from '../../context/ItemProvider';
import { useForm } from '../../context/FormProvider';
import ActionButton from '../buttons/ActionButton';
import Timeline from '../Timeline';

const User = ({ user }) => {
    const { handleItemClick } = useDrawer()
    const { setFormType } = useForm()
    
    return (
        <Box>
            <Box>
                <Heading as="h1" size="lg" mb="4">{user.userName}</Heading>
                <Text fontSize="lg">{user.deptName}</Text>
            </Box>

            <Box>
                <Heading as="h2" size="md" mb="2">PAST DEVICES</Heading>
                {user.pastAssets.map((asset) => (
                    <Button onClick={() => handleItemClick(user)} colorScheme="blue">
                        {asset.assetTag} - {asset.variant}
                    </Button>
                ))}
            </Box>

            <Box>
                <Heading as="h2" size="md" mb="2">CURRENT DEVICES</Heading>
                {user.currentDevices.map((asset) => (
                    <Flex alignItems="center" mb="2">
                        <Text mr="2">{asset.assetTag} - {asset.variant}</Text>
                        <ActionButton bg="orange.100" onClick={() => setFormType('returnAsset')}>
                            Return
                        </ActionButton>
                    </Flex>
                ))}
            </Box>

            <Box>
                <IconButton
                    icon={<InfoOutlineIcon />}
                    isRound
                    aria-label="Bookmark"
                />
                <Button colorScheme="red" ml="2" data-user-id={user.id}>Resign</Button>
                <Button colorScheme="green" ml="2" data-user-id={user.id}>Loan Device</Button>
            </Box>

            <Timeline events={user.events}/>
        </Box>
    );
};

export default User;