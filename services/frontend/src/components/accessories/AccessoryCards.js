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
import { AccTypeActionButton } from "../buttons/actions/AccTypeActionButton";
import { FormType, useFormModal } from "../../context/ModalProvider";
import { useState } from "react";
import StarButton from "../buttons/StarButton";
import { useItems } from "../../context/ItemsProvider";
import { ResponsiveText } from "../utils/ResponsiveText";
import { CircleText } from "../utils/CircleText";
import { AccTypeLink } from "../buttons/ItemLink";

function AccessoryCards({ items }) {

  const { handleUpdate } = useItems()

  return (
    <Cards>
    {items.map((accessoryType) => (
      <Box key={accessoryType.accessoryTypeId}>
        <Card 
          h="100%" 
          w="100%" 
          _hover={{bg: 'gray.100',}}
        >
          <CardBody>
            <Flex>
              <VStack align="start" flex='1'>
                <Flex gap={2} alignItems="center">
                  <AccTypeLink accType={accessoryType}/>
                  <Box alignSelf='flex-end'>
                    <AccTypeActionButton
                      key={FormType.UPDATE_ACC}
                      formType={FormType.UPDATE_ACC}
                      accType={accessoryType}
                    />
                  </Box>
                </Flex>
                <Flex direction="column" justifyContent='space-evenly' alignSelf='stretch' gap={1}>
                  <Flex gap={1}>
                    <CircleText
                      text={accessoryType.registeredCount ? accessoryType.registeredCount : 0}
                    />
                    <ResponsiveText>Registered</ResponsiveText>
                  </Flex>
                  <Flex gap={1}>
                    <CircleText
                      text={accessoryType.stock ? accessoryType.stock : 0}
                    />
                    <ResponsiveText>Available</ResponsiveText>
                  </Flex>
                  <Flex gap={1}>
                    <CircleText
                      text={accessoryType.loanCount ? accessoryType.loanCount : 0}
                    />
                    <ResponsiveText>Loaned</ResponsiveText>
                  </Flex>
                  <Flex gap={1}>
                    <CircleText
                      text={accessoryType.reserveCount ? accessoryType.reserveCount : 0}
                    />
                    <ResponsiveText>Reserved</ResponsiveText>
                  </Flex>
                </Flex>
              </VStack>
            </Flex>
          </CardBody>
          
          <StarButton
            position="absolute" top={2} right={2}
            id={accessoryType.accessoryTypeId}
            isBookmarked={accessoryType.bookmarked}
            onToggle={handleUpdate}
          />
        </Card>
      </Box>
      ))}
    </Cards>
  );
}

export default AccessoryCards