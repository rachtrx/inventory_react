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
import { AssetList } from "./AssetList";
import StarButton from "../buttons/StarButton";
import { useGlobal } from "../../context/GlobalProvider";
import { ItemLink } from "../buttons/ItemLink";

function UserCards({ items }) {

  const { handleUserToggle } = useGlobal()

  return (
    <Cards>
    {items.map((user) => (
      <Box key={user.id}>
        <Card 
          h="100%" 
          w="100%" 
          _hover={{bg: 'gray.100',}}
        >
          <CardBody> {/*onClick={() => handleItemClick(user)}*/}
          <VStack align="start">
            <ItemLink item={user} size={'lg'} fontWeight="bold"/>
            <Text fontSize="md" fontWeight="semibold">
              {user.department}
            </Text>
            {user.assets?.length > 0 ? <AssetList user={user}/> : 
              <Flex>
                <ActionButton formType={user.deletedDate ? formTypes.RESTORE_USER : formTypes.LOAN} item={user} style={{ marginLeft: 'auto' }} />
              </Flex>
            }
          </VStack>
          </CardBody>
          
          <StarButton
            position="absolute" top={2} right={2}
            id={user.id}
            isBookmarked={user.bookmarked}
            onToggle={handleUserToggle}
          />
        </Card>
      </Box>
      ))}
    </Cards>
  );
}

export default UserCards