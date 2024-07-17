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
import Cards from '../Cards';
import { useDrawer } from "../../context/DrawerProvider";
import ActionButton from "../buttons/ActionButton";
import { useModal } from "../../context/ModalProvider";
import { useState } from "react";
import { SplitReturnButton } from "../buttons/SplitReturnButton";

function UserCards({ items }) {

  const [hoveredUserId, setHoveredUserId] = useState(null);

    const { handleItemClick } = useDrawer()
    const { setFormType } = useModal()

    return (
        <Cards>
        {items.map((user) => (
        <Box key={user.id}>
        <Card 
          h="100%" 
          w="100%" 
          _hover={{
            bg: hoveredUserId === user.id ? 'blue.50' : 'blue.100',
            cursor: 'pointer',
          }}
          _active={{ bg: hoveredUserId === user.id ? 'blue.50' : 'blue.200', }}
        >
          <CardBody onClick={() => handleItemClick(user)}>
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              {user.name}
            </Text>
            <Text fontSize="md" fontWeight="semibold">
              {user.department}
            </Text>
            
            {user.assets && (
              <>
                <Text fontSize="lg" fontWeight="semibold">Assets</Text>
                <VStack
                  align="stretch"
                  spacing={2}
                  overflowY="auto"
                  maxH="50px"
                >
                  {user.assets.map((asset) => (
                    <Box key={asset.id} w="100%">
                    <SplitReturnButton
                      item={asset}
                      onMouseEnterFn={() => setHoveredUserId(user.id)}
                      onMouseLeaveFn={() => setHoveredUserId(null)}
                    />
                  </Box>
                  ))}
                </VStack>
              </>
            )}
          </CardBody>
    
          <Button variant="ghost" position="absolute" top={2} right={2} aria-label="Bookmark">
            {user.bookmarked === 1 ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          </Button>
        </Card>
      </Box>
      ))}
        </Cards>
    );
}

export default UserCards