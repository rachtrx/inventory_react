import { Table, Thead, Tbody, Tr, Th, Td, Link, IconButton, Button } from '@chakra-ui/react';
import IconBookmark from '../../pages/components/icons/IconBookmark';
import { API_URL, eventToStatus } from '../../config';
import { useAsset } from '../../context/AssetProvider';

const AssetTable = ({ items }) => {

	const { setCurrentAsset } = useAsset()

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
              <Link href={`${API_URL}views/show_device#${asset.id}`} isExternal>
                {asset.assetTag}
              </Link>
            </Td>
            <Td>{asset.serialNumber}</Td>
            <Td>{asset.modelName}</Td>
            <Td>
              {eventToStatus(asset.status)}
            </Td>
            <Td>
              {asset.status === 'loaned' && (
								<Button onClick={() => setCurrentAsset(asset.id)} colorScheme="blue">
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
