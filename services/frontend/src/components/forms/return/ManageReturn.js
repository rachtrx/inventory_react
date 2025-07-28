import { Table, Thead, Tbody, Tr, Th, Td, Flex, Text } from '@chakra-ui/react';
import { useReturn } from './ReturnProvider';
import InputFormControl from '../utils/InputFormControl';

export const ManageReturn = () => {
  const { ret, returnIndex, expectedReturnDate } = useReturn();

  const showAsset = !!ret.asset?.assetId
  const showAccessories = ret.accessoryTypes?.length > 0

  return (
    <Flex direction="column" gap={2} overflowX="auto">
      {expectedReturnDate && <Text>Expected Return: {expectedReturnDate}</Text>}

      <Table variant="simple">
        {/* Conditional Headers for Asset and Accessories */}
        <Thead>
          <Tr>
            <Th colSpan={3} textAlign="center">
              {showAsset && !showAccessories ? "Assets" : null}
              {!showAsset && showAccessories ? "Accessories" : null}
              {showAsset && showAccessories ? "Assets & Accessories" : null}
            </Th>
          </Tr>
          <Tr>
            <Th>Item</Th>
            <Th>Count Loaned</Th>
            <Th>Return Count</Th>
          </Tr>
        </Thead>

        {/* Conditional Bodies for Asset and Accessories */}
        <Tbody>
          {showAsset &&
            (
              <Tr key={ret.asset.assetId}>
                <Td>{ret.asset.serialNumber}</Td>
                <Td>{ret.asset.unreturned}</Td>
                <Td>
                  <InputFormControl
                    name={`returns.${returnIndex}.asset.count`}
                    type="number"
                    placeholder="Enter count"
                    max={ret.asset.unreturned ? 1 : 0}
                    min={0}
                    disabled={ret.asset.unreturned === 0}
                  />
                </Td>
              </Tr>
            )}

          {showAccessories &&
            ret.accessoryTypes?.map((accessoryType, accessoryIndex) => (
              <Tr key={accessoryType.accessoryTypeId}>
                <Td>{accessoryType.accessoryName}</Td>
                <Td>{accessoryType.unreturned}</Td>
                <Td>
                  <InputFormControl
                    name={`returns.${returnIndex}.accessoryTypes.${accessoryIndex}.count`}
                    placeholder="Enter count"
                    max={accessoryType.unreturned}
                    min={0}
                    disabled={accessoryType.unreturned === 0}
                  />
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
      <Text>User: {ret.userName}</Text>
    </Flex>
  );
};