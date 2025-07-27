// SelectableTable.jsx
import {
  Table, Thead, Tbody, Tr, Th, Td, Checkbox,
} from "@chakra-ui/react";
import { useItems } from "../../context/ItemsProvider";

export function SelectableTable({ columns, renderRow }) {
  const { selectedItems, data, handleSelectAll, handleSelectOne, itemKey } = useItems();
  const allSelected = data.length > 0 && selectedItems.length === data.length;

  return (
    <Table size="sm" variant="simple">
      <Thead bg="gray" position="sticky" top={0} zIndex={1}>
        <Tr>
          <Th>
            <Checkbox isChecked={allSelected} onChange={handleSelectAll} />
          </Th>
          {columns}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((item) => {
          const id = item[itemKey];
          const { cells, props = {} } = renderRow(item);
          return (
            <Tr key={id} {...props}>
							<Td>
								<Checkbox
									isChecked={selectedItems.some(i => i[itemKey] === id)}
									onChange={() => handleSelectOne(item)}
								/>
							</Td>
            	{cells}
            </Tr>
        );
        })}
      </Tbody>
    </Table>
  );
}