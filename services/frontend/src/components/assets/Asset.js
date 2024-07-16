import { Box, Heading, Text, Button, Flex, Link, IconButton, useDisclosure } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, CheckIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { eventToStatus } from '../../config';
import { useDrawer } from '../../context/ItemProvider';
import { useForm } from '../../context/FormProvider';
import ActionButton from '../buttons/ActionButton';
import Timeline from '../Timeline';

const Asset = ({ asset }) => {
  const { handleItemClick } = useDrawer()
  const { setFormType } = useForm()

  return (
    <Box className="show-device-overview">
        <Box className="show-device-container">
            <Heading as="h1" size="lg" mb="4">Asset Tag: {asset.assetTag}</Heading>
            <Box className="show-device-asset">
                <Text fontSize="lg">Serial Number: {asset.serialNumber}</Text>
                <Text fontSize="lg">Model: {asset.variant}</Text>
                <Text fontSize="lg">Type: {asset.assetType}</Text>
                <Text fontSize="lg">Vendor: {asset.vendor}</Text>
                <Box className="location-edit-component">
                    <Text fontSize="lg">Value: </Text>
                    <Text fontSize="lg" className="edit-el">{asset.value}</Text>
                    <Button leftIcon={<EditIcon />}>Edit</Button>
                    <Button leftIcon={<CheckIcon />} className="hidden-visibility" data-model-value={asset.id}>Save</Button>
                </Box>
                <Box className="location-edit-component">
                    <Text fontSize="lg">Location: </Text>
                    <Text fontSize="lg" className="edit-el">{asset.location}</Text>
                    <Button leftIcon={<EditIcon />}>Edit</Button>
                    <Button leftIcon={<CheckIcon />} className="hidden-visibility" data-location-name={asset.id}>Save</Button>
                </Box>
            </Box>
        </Box>

        <Box className="show-device-users--past">
            <Heading as="h2" size="md" mb="2">PAST USERS</Heading>
            {asset.pastUsers.map((user) => (
                <Button onClick={() => handleItemClick(user)} colorScheme="blue">
                  {user.userName}
                </Button>
            ))}
        </Box>

        <Box className="show-device-users--current">
            <Heading as="h2" size="md" mb="2">STATUS</Heading>
            <Text>
                {eventToStatus(asset.status)}
            </Text>
            {asset.status === 'loaned' && (
                <Flex alignItems="center">
                    <Text mr="2">USER:</Text>
                    <Button onClick={() => handleItemClick(asset.currentUser)} colorScheme="blue">
                      {asset.currentUser.userName}
                    </Button>
                    <ActionButton bg="orange.100" onClick={() => setFormType('returnAsset')}>
                        Return
                    </ActionButton>
                </Flex>
            )}
        </Box>
        <Box className="show-device-actions">
            <IconButton
                icon={<InfoOutlineIcon />}
                isRound
                aria-label="Bookmark"
            />
            {asset.status !== 'condemned' && asset.status !== 'loaned' && (
                <Flex>
                    <Button data-asset-id={asset.id}>CONDEMN</Button>
                    <Button data-asset-id={asset.id}>LOAN</Button>
                </Flex>
            )}
        </Box>

        <Timeline events={asset.events}/>
    </Box>
  );
}

export default Asset;
