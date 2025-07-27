import { Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';
import { useItems } from '../../context/ItemsProvider';
import { ItemStarButton } from '../buttons/StarButton';
import { AssetLink, UserLink } from '../buttons/ItemLink';
import { CardActions } from './CardActions';
import { Tags } from '../tags/Tags';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';

const AssetTable = ({ items }) => {

  const { handleUpdate, handleSort, sortOrder, sortField } = useItems()

  return (
    <Table size="sm" variant="simple">
      <Thead position="sticky" top="0" zIndex="1" bg="gray">
        <Tr>
          <Th></Th>
          <Th onClick={() => handleSort("typeName")} cursor="pointer">
            Device Type {sortField === "typeName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
          <Th onClick={() => handleSort("subTypeName")} cursor="pointer">
            Model {sortField === "subTypeName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
          <Th onClick={() => handleSort("serialNumber")} cursor="pointer">
            S/N {sortField === "serialNumber" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
          </Th>
          <Th>Tags</Th>
          <Th>Options</Th>
          <Th>Users</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((asset) => (
          <Tr 
            key={asset.assetId}
            _hover={{ bg: 'gray' }}
          >
            <Td>
              <ItemStarButton
                id={asset.assetId}
                isBookmarked={asset.bookmarked}
                onToggle={handleUpdate}
              />
            </Td>
            <Td><Text>{asset.typeName}</Text></Td>
            <Td><Text>{asset.subTypeName}</Text></Td>
            <Td><AssetLink item={asset} size={'lg'} fontWeight="bold"/></Td>
            <Td><Tags tags={asset.tags} textSize="xs"/></Td>
            <Td>
              <CardActions asset={asset}/>
            </Td>
            <Td>{asset.loan && <UserLink item={asset.loan.user} fontWeight="bold"/>}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default AssetTable;
