import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Button, useColorModeValue, VStack, Box, Flex } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import IconBookmark from '../../pages/components/icons/IconBookmark';
import ActionButton from '../buttons/ActionButton';
import { useDrawer } from '../../context/DrawerProvider';
import { useModal } from '../../context/ModalProvider';
import { SplitReturnButton } from '../buttons/SplitReturnButton';
import { useResponsive } from '../../context/ResponsiveProvider';
import { ResponsiveText } from '../utils/ResponsiveText';

const UserTable = ({ items }) => {

  const { handleItemClick } = useDrawer()
  const { textSize } = useResponsive()

  return (
    <Table variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg={useColorModeValue('gray.100', 'gray.700')}>
        <Tr>
          <Th>User Name</Th>
          <Th>Department</Th>
          <Th>Assets</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((user) => (
          <Tr key={user.id}>
            <Td>
            <Button onClick={() => handleItemClick(user)} colorScheme="blue" maxWidth="200px" overflow="hidden">
              <ResponsiveText fontSize={textSize} fontWeight="bold" isTruncated>
                {user.name}
              </ResponsiveText>
            </Button>
            </Td>
            <Td><ResponsiveText fontSize={textSize}>{user.department}</ResponsiveText></Td>
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
                <Flex key={asset.id} gap={2}>
                    <SplitReturnButton
                      item={asset}
                    />
                </Flex>
                ))}
            </VStack>
            ) : (
              <ResponsiveText fontSize={textSize}>'No assets assigned'</ResponsiveText>
            )}
            </Td>
            <IconButton
              aria-label="Bookmark"
              icon={user.bookmarked === 1 ? <IconBookmark fill={true} /> : <IconBookmark />}
              // variant="ghost"
            />
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default UserTable;