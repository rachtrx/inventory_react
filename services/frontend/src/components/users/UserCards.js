import { 
    VStack,
    Button,
    Text,
    Box,
    useColorModeValue,
    CardBody,
    Card,
} from "@chakra-ui/react";
import { FaBookmark as BookmarkFilledIcon, FaRegBookmark as BookmarkIcon } from 'react-icons/fa';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Cards from '../utils/Cards';
import { useDrawer } from "../../context/DrawerProvider";
import ActionButton from "../buttons/ActionButton";
import { formTypes, useFormModal } from "../../context/ModalProvider";
import { useState } from "react";
import { SplitButton, UserActionButton } from "../buttons/SplitButton";
import StarButton from "../buttons/StarButton";
import { useGlobal } from "../../context/GlobalProvider";
import { ItemLink } from "../buttons/ItemLink";

function UserCards({ items }) {

  const [hoveredUserId, setHoveredUserId] = useState(null);

  const { handleItemClick } = useDrawer()
  const { handleUserToggle } = useGlobal()

  return (
    <Cards>
    {items.map((user) => (
      <Box key={user.id}>
        <Card 
          h="100%" 
          w="100%" 
          _hover={{
            bg: hoveredUserId === user.id ? 'gray.50' : 'gray.100',
          }}
          _active={{ bg: hoveredUserId === user.id ? 'gray.50' : 'gray.200', }}
        >
          <CardBody onClick={() => handleItemClick(user)}>
          <VStack align="start">
          <ItemLink item={user} size={'lg'} fontWeight="bold" setHoveredFn={setHoveredUserId}/>
            <Text fontSize="md" fontWeight="semibold">
              {user.department}
            </Text>
            
            <UserActionButton user={user} setHoveredUserId={setHoveredUserId}/>
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