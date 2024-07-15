import { Table, Thead, Tbody, Tr, Th, Td, Link, IconButton, Button, useColorModeValue, VStack, Box } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import IconBookmark from '../../pages/components/icons/IconBookmark';

const UserTable = ({ items }) => {
  return (
    <Table variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th>User Name</Th>
          <Th>Department</Th>
          <Th>Assets</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((user) => (
          <Tr key={user.id}>
            <Td>
              <Link href={`views/show_user#${user.id}`} isExternal>
                {user.name}
              </Link>
            </Td>
            <Td>{user.department}</Td>
            <Td>
            {user.assets ? (
            <VStack
                align="stretch"
                spacing={2}
                overflowY="auto"
                maxH="80px" 
                className="scroll-window"
            >
                {user.assets.map((asset) => (
                <Box key={asset.id}>
                    <Link href={`views/show_asset#${asset.id}`} isExternal>
                    {asset.assetTag} - {asset.variant}
                    </Link>
                    <Button ml={2} as={Link} href={`forms/returned_asset?asset-tag=${asset.id}`} variant="link" colorScheme="blue" rightIcon={<ExternalLinkIcon />}>
                    Return
                    </Button>
                </Box>
                ))}
            </VStack>
            ) : (
            'No assets assigned'
            )}
            </Td>
            <Td>
              <IconButton
                aria-label="Bookmark"
                icon={user.bookmarked === 1 ? <IconBookmark fill={true} /> : <IconBookmark />}
                variant="ghost"
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default UserTable;