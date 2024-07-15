import { 
    VStack,
    Button,
    Link,
    Text,
    Box,
    useColorModeValue
} from "@chakra-ui/react";
import { FaBookmark as BookmarkFilledIcon, FaRegBookmark as BookmarkIcon } from 'react-icons/fa';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import Cards from '../Cards';

function UserCards({ items }) {

    const cardBg = useColorModeValue('white', 'gray.800');

    return (
        <Cards>
        {items.map((user) => (
        <Box key={user.id} bg={cardBg} p={4} boxShadow="md" borderRadius="lg" position="relative" data-user-id={user.id}>
          <Link href={`views/show_user#${user.userId}`} isExternal>
            <Text fontSize="xl" fontWeight="bold">{user.name}</Text>
            <Text fontSize="md">{user.department}</Text>
          </Link>

          {user.assets && (
            <VStack align="start" mt={4}>
              <Text fontSize="lg" fontWeight="semibold">assets</Text>
              <VStack
                align="stretch"
                spacing={2}
                overflowY="auto"
                maxH="80px" 
                className="scroll-window"
                >
                {user.assets.map((asset) => (
                  <Box key={asset.id}>
                    <Link href={`views/show_asset#${asset.id}`} isExternal>
                      <Text>{asset.assetTag} - {asset.variant}</Text>
                    </Link>
                    <Link href={`forms/returned_asset?asset-tag=${asset.assetId}`} isExternal>
                      <Button variant="link" colorScheme="blue" rightIcon={<ExternalLinkIcon />}>Return asset</Button>
                    </Link>
                  </Box>
                ))}
              </VStack>
            </VStack>
          )}

          <Button variant="ghost" position="absolute" top={2} right={2} aria-label="Bookmark">
            {user.bookmarked === 1 ? <BookmarkFilledIcon /> : <BookmarkIcon />}
          </Button>
        </Box>
      ))}
        </Cards>
    );
}

export default UserCards