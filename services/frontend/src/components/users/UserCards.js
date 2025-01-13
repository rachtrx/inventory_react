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
import { UserActionButton } from "../buttons/ActionButton";
import { FormType, useFormModal } from "../../context/ModalProvider";
import { useState } from "react";
import { AssetList } from "./AssetList";
import StarButton from "../buttons/StarButton";
import { useItems } from "../../context/ItemsProvider";
import { UserLink } from "../buttons/ItemLink";

function UserCards({ items }) {

  return (
    <Cards>
    {items.map((user) => (
      <Box key={user.userId}>
        <Card 
          h="100%" 
          w="100%" 
          _hover={{bg: 'gray.100',}}
        >
          <CardBody>
          <VStack align="start">
            <UserLink user={user} size={'lg'} fontWeight="bold"/>
            <Text fontSize="md" fontWeight="semibold">
              {user.department.deptName}
            </Text>
            {user.userLoans?.length > 0 ? <AssetList user={user}/> : 
              <Flex>
                <UserActionButton 
                  formType={user.deleteEvent ? FormType.RESTORE_USER : FormType.LOAN} 
                  user={user} 
                  style={{ marginLeft: 'auto' }} 
                />
              </Flex>
            }
          </VStack>
          </CardBody>
          
          <StarButton
            position="absolute" top={2} right={2}
            id={user.userId}
            isBookmarked={user.bookmarked}
          />
        </Card>
      </Box>
      ))}
    </Cards>
  );
}

export default UserCards