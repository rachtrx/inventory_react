import { 
    VStack,
    Button,
    Text,
    Box,
    useColorModeValue,
    CardBody,
    Card,
    Flex,
} from "@chakra-ui/react";
import { FaBookmark as BookmarkFilledIcon, FaRegBookmark as BookmarkIcon } from 'react-icons/fa';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Cards from '../utils/Cards';
import { useDrawer } from "../../context/DrawerProvider";
import ActionButton from "../buttons/ActionButton";
import { formTypes, useFormModal } from "../../context/ModalProvider";
import { useState } from "react";
import StarButton from "../buttons/StarButton";
import { useItems } from "../../context/ItemsProvider";
import { ItemLink } from "../buttons/ItemLink";
import { ResponsiveText } from "../utils/ResponsiveText";
import { CircleText } from "../utils/CircleText";

function PeripheralCards({ items }) {

  const { handleUpdate } = useItems()

  return (
    <Cards>
    {items.map((peripheralType) => (
      <Box key={peripheralType.id}>
        <Card 
          h="100%" 
          w="100%" 
          _hover={{bg: 'gray.100',}}
        >
          <CardBody> {/*onClick={() => handleItemClick(peripheralType)}*/}
            <Flex>
              <VStack align="start" flex='1'>
                <ResponsiveText fontSize="lg" fontWeight="semibold">{peripheralType.peripheralName.toUpperCase()}</ResponsiveText>
                <ResponsiveText fontSize="md" fontWeight="semibold">
                  Stock: {peripheralType.availableCount}
                </ResponsiveText>
                <Flex justifyContent='space-evenly' alignSelf='stretch'>
                  <Flex gap={2}>
                    <CircleText
                      text={peripheralType.assets ? Object.keys(peripheralType.assets).length : 0}
                    />
                    <ResponsiveText>Assets</ResponsiveText>
                  </Flex>
                  <Flex gap={2}>
                    <CircleText
                      text={peripheralType.users ? Object.keys(peripheralType.users).length : 0}
                    />
                    <ResponsiveText>Users</ResponsiveText>
                  </Flex>
                </Flex>
                
                
              </VStack>
              <Box alignSelf='flex-end'>
                <ActionButton
                  key={formTypes.ADD_PERIPHERAL}
                  formType={formTypes.ADD_PERIPHERAL}
                  item={peripheralType}
                  initialValues={{peripheralName: peripheralType.peripheralName}}
                />
              </Box>
            </Flex>
          </CardBody>
          
          <StarButton
            position="absolute" top={2} right={2}
            id={peripheralType.id}
            isBookmarked={peripheralType.bookmarked}
            onToggle={handleUpdate}
          />
        </Card>
      </Box>
      ))}
    </Cards>
  );
}

export default PeripheralCards