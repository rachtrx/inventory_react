// SelectableCards.jsx
import {
  Checkbox,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Flex,
} from "@chakra-ui/react";
import { useItems } from "../../context/ItemsProvider";
import Cards from "./Cards";

export default function SelectableCards({ items, renderCard }) {
  const { selectedItems, handleSelectOne, handleSelectAll, itemKey } = useItems();

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  return (
    <VStack w="full" align="stretch" spacing={4}>
      {/* Toolbar */}
      <Flex justify="space-between" align="center" px={2}>
        <Checkbox isChecked={allSelected} onChange={handleSelectAll}>
          Select All
        </Checkbox>
      </Flex>

      {/* Cards */}
      <Cards>
        {items.map((item) => {
          const id = item[itemKey];
          const isSelected = selectedItems.some((i) => i[itemKey] === id);

          const { body, props = {} } = renderCard(item);

          return (
            <Card
              key={id}
              position="relative"
              border={isSelected ? "2px solid" : "1px solid"}
              role="group"
              h="100%"
							w="100%"
							overflow="hidden"
							bg="transparent"
        			_hover={{ bg: 'gray' }}
              {...props}
            >
              <CardHeader pb={0}>
                <Checkbox
                  isChecked={isSelected}
                  onChange={() => handleSelectOne(item)}
                  position="absolute"
                  top="0.5rem"
                  left="0.5rem"
                  opacity={isSelected ? 1 : 0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                />
              </CardHeader>

              <CardBody pt={2}>
                {body}
              </CardBody>
            </Card>
          );
        })}
      </Cards>
    </VStack>
  );
}
