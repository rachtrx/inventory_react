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
            <VStack align="start">
              <ItemLink item={peripheralType} size={'lg'} fontWeight="bold"/>
              <ResponsiveText fontSize="md" fontWeight="semibold">
                {peripheralType.availableCount} Untagged / {peripheralType.totalCount}
              </ResponsiveText>
              <CircleText
                text={peripheralType.peripherals?.assets?.length || 0}
              />
              <ResponsiveText>Assets</ResponsiveText>
              <CircleText
                text={peripheralType.peripherals?.users?.length || 0}
              />
              <ResponsiveText>Users</ResponsiveText>
                <Flex>
                  {peripheralType.availableCount && <ActionButton formType={formTypes.TAG} item={peripheralType} style={{ marginLeft: 'auto' }} />}
                  {peripheralType.availableCount !== peripheralType.totalCount && <ActionButton formType={formTypes.UNTAG} item={peripheralType} style={{ marginLeft: 'auto' }} />}
                </Flex>
            </VStack>
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