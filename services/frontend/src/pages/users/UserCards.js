import React from 'react';
import { Link, VStack, Box, Text, IconButton, useColorModeValue, Icon } from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import IconBookmark from '../components/icons/IconBookmark'; // Ensure you have an IconBookmark component or replace it with a suitable one

const ASSET_HOMEPAGE_URL = 'http://localhost/'; // Define your asset homepage URL

export default function UserCards({ users }) {
  const bg = useColorModeValue('white', 'gray.700'); // Adjusts color based on theme

  return (
    <VStack spacing={4}>
      {users.map((user) => (
        <Box key={user.userId} data-user-id={user.userId} bg={bg} p={5} shadow="md" borderWidth="1px" position="relative" w="full">
            <Link href={`${ASSET_HOMEPAGE_URL}views/show_user#${user.userId}`} isExternal>
                <Text fontSize="xl" fontWeight="bold">{user.userName}</Text>
                <Text fontSize="md">{user.deptName}</Text>
            </Link>
            <Text fontSize="lg" fontWeight="semibold" mt={4}>Devices</Text>
            <VStack spacing={2} align="start">
                {user.devices && user.devices.map((device) => (
                <Box key={device.assetId}>
                    <Link href={`${ASSET_HOMEPAGE_URL}views/show_device#${device.assetId}`} isExternal>
                    <Text>{device.assetTag} - {device.modelName} <Icon as={FaExternalLinkAlt} /></Text>
                    </Link>
                    <Link href={`${ASSET_HOMEPAGE_URL}forms/returned_device?asset-tag=${device.assetId}`} color="blue.500" isExternal>
                    Return Device
                    </Link>
                </Box>
                ))}
            </VStack>
            <IconButton
                aria-label="Bookmark"
                icon={<IconBookmark fill={user.bookmarked === 1} />}
                variant="ghost"
                position="absolute"
                top={2}
                right={2}
            />
        </Box>
      ))}
    </VStack>
  );
}