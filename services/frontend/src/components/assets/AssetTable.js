import { Table, Thead, Tbody, Tr, Th, Td, Link, IconButton } from '@chakra-ui/react';
import IconBookmark from '../../pages/components/icons/IconBookmark';
import { API_URL, eventToStatus } from '../../config';

const AssetTable = ({ items }) => {
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
            <Td className={asset.status === 'loaned' ? 'unavailable' : 'available'}>
              {eventToStatus(asset.status)}
            </Td>
            <Td>
              {asset.status === 'loaned' ? (
                <Link href={`views/show_user#${asset.userId}`} isExternal>
                  {asset.userName}
                </Link>
              ) : (
                '-'
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
