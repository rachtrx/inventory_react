import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Button } from '@chakra-ui/react';
import IconBookmark from '../../pages/components/icons/IconBookmark';
import { eventToStatus } from '../../config';
import { useDrawer } from '../../context/DrawerProvider';

const AssetTable = ({ items }) => {

	const { handleItemClick } = useDrawer()

  return (
    <Table variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg="gray.200">
        <Tr>
          <Th>Asset Tag</Th>
          <Th>Serial Number</Th>
          <Th>Model Name</Th>
          <Th>Status</Th>
          <Th>User</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((asset) => (
          <Tr key={asset.id}>
            <Td>
            <Button onClick={() => handleItemClick(asset)} colorScheme="blue">
              {asset.assetTag}
            </Button>
            </Td>
            <Td>{asset.serialNumber}</Td>
            <Td>{asset.modelName}</Td>
            <Td>
              {eventToStatus(asset.status)}
            </Td>
            <Td>
              {asset.status === 'loaned' && (
								<Button onClick={() => handleItemClick(asset)} colorScheme="blue">
									{asset.userName}
								</Button>
              )}
            </Td>
            <Td>
              <IconButton
                aria-label="Bookmark"
                icon={asset.bookmarked === 1 ? <IconBookmark fill={true} /> : <IconBookmark />}
                variant="ghost"
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default AssetTable;
