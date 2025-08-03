// AssetTable.jsx
import {
  Th,
  Td,
  Text,
} from '@chakra-ui/react';
import { useItems } from '../../context/ItemsProvider';
import { ItemStarButton } from '../buttons/StarButton';
import { AssetLink, UserLink } from '../buttons/ItemLink';
import { CardActions } from './CardActions';
import { Tags } from '../tags/Tags';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { SelectableTable } from "../utils/SelectableTable";

const AssetTable = () => {
  const { handleUpdate, handleSort, sortOrder, sortField } = useItems();

  return (
    <SelectableTable
      columns={[
        <Th key="star-col" />,
        <Th key="type" onClick={() => handleSort("typeName")} cursor="pointer">
          Device Type {sortField === "typeName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
        <Th key="model" onClick={() => handleSort("subTypeName")} cursor="pointer">
          Model {sortField === "subTypeName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
        <Th key="serial" onClick={() => handleSort("serialNumber")} cursor="pointer">
          S/N {sortField === "serialNumber" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
        <Th key="tags">Tags</Th>,
        <Th key="options">Options</Th>,
        <Th key="users">Users</Th>,
      ]}
      renderRow={(asset) => {
        return {
          props: {
            _hover: { bg: "bgGray" }
          },
          cells: [
            <Td key="star">
              <ItemStarButton
                id={asset.assetId}
                isBookmarked={asset.bookmarked}
                onToggle={handleUpdate}
              />
            </Td>,
            <Td key="type"><Text>{asset.typeName}</Text></Td>,
            <Td key="model"><Text>{asset.subTypeName}</Text></Td>,
            <Td key="sn">
              <AssetLink item={asset} size="lg" fontWeight="bold" />
            </Td>,
            <Td key="tags">
              <Tags tags={asset.tags} textSize="xs" />
            </Td>,
            <Td key="actions">
              <CardActions asset={asset} />
            </Td>,
            <Td key="user">
              {asset.loan && <UserLink item={asset.loan.user} fontWeight="bold" />}
            </Td>
          ]
        };
      }}
    />
  );
};

export default AssetTable;
