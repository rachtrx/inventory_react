// AccessoryTable.jsx
import {
  Th,
  Td,
  Flex,
  Text,
} from '@chakra-ui/react';
import { useItems } from '../../context/ItemsProvider';
import { AccTypeLink } from '../buttons/ItemLink';
import { CircleText } from '../utils/CircleText';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import accessoryService from '../../services/AccessoryService';
import { LoansPopover } from './LoansPopover';
import { CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { FormType } from '../../context/FormProvider';
import { SelectableTable } from '../utils/SelectableTable';

const AccessoryTable = () => {
  const { handleSort, sortField, sortOrder } = useItems();

  return (
    <SelectableTable
      columns={[
        <Th key="name" onClick={() => handleSort("accessoryName")} cursor="pointer">
          Accessory Name {sortField === "accessoryName" && (sortOrder === "asc" ? <TriangleUpIcon /> : <TriangleDownIcon />)}
        </Th>,
        <Th key="available">Available</Th>,
        <Th key="registered">Registered</Th>,
        <Th key="loaned">Loaned</Th>,
        <Th key="reserved">Reserved</Th>
      ]}
      renderRow={(accessoryType) => {
        return {
          props: { _hover: { bg: 'bgGray' } },
          cells: [
            <Td key="name">
              <Flex gap={1}>
                <AccTypeLink accType={accessoryType} size="lg" fontWeight="bold" />
                <CircleAccTypeActionButton
                  size="sm"
                  formType={FormType.UPDATE_ACC}
                  accTypeIds={accessoryType.accessoryTypeId}
                />
              </Flex>
            </Td>,
            <Td key="available">
              <CircleText text={accessoryType.stock || 0} />
              <Text>Available</Text>
            </Td>,
            <Td key="registered">
              <CircleText text={accessoryType.registeredCount || 0} />
              <Text>Registered</Text>
            </Td>,
            <Td key="loaned">
              <LoansPopover
                accessoryType={accessoryType}
                searchFunc={(id) => accessoryService.getLoanDetails(id)}
                count={accessoryType.loanCount}
              />
              <Text>Loaned</Text>
            </Td>,
            <Td key="reserved">
              <LoansPopover
                accessoryType={accessoryType}
                searchFunc={(id) => accessoryService.getReservationDetails(id)}
                count={accessoryType.reserveCount}
              />
              <Text>Reserved</Text>
            </Td>
          ]
        };
      }}
    />
  );
};

export default AccessoryTable;
