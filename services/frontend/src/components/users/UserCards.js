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
import { UserActionButton } from "../buttons/actions/UserActionButton";
import { FormType, useFormModal } from "../../context/ModalProvider";
import { useState } from "react";
import { ItemsList } from "./popovers/ItemsList";
import StarButton from "../buttons/StarButton";
import { useItems } from "../../context/ItemsProvider";
import { UserLink } from "../buttons/ItemLink";
import Tags from "../tags/Tags";

function UserCards({ items }) {

  return (
    <Cards>
    {items.map((user) => (
      <Box key={user.userId}>
        <Card 
          h="100%" 
          w="100%" 
          bg="transparent" 
          _hover={{bg: 'gray.100'}}
          overflow="visible"
          role="group"
        >
          <CardBody>
            <Flex>
              <VStack align="start" flex='1'>
                <UserLink user={user} size={'lg'} fontWeight="bold"/>
                <Text fontSize="md" fontWeight="semibold">
                  {user.deptName}
                </Text>
                {user.loans?.length > 0 && <ItemsList user={user}/>}
                <Flex>
                  {!user.deleteEvent && 
                    <UserActionButton 
                      formType={FormType.LOAN} // TODO FormType.RESTORE_USER
                      user={user} 
                      style={{ marginLeft: 'auto' }} 
                    />
                  }
                </Flex>
                <Tags tags={user.tags}/>
              </VStack>

              <StarButton
                id={user.userId}
                isBookmarked={user.bookmarked}
              />
            </Flex>
          </CardBody>
        </Card>
      </Box>
      ))}
    </Cards>
  );
}

export default UserCards