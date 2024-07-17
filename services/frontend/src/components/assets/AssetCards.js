import { API_URL, eventToStatus } from '../../config';

import { 
    Card,
    CardBody,
    Text,
    Button,
    Box,
} from "@chakra-ui/react";
import { FaBookmark as BookmarkFilledIcon, FaRegBookmark as BookmarkIcon } from 'react-icons/fa';
import Cards from '../Cards';
import { useDrawer } from '../../context/DrawerProvider';

function AssetCards({items}) {
    const { handleItemClick } = useDrawer()
    
    return (
        <Cards>
            {items.map((asset) => (
            <Box key={asset.id}>
                <Card 
                    h="100%" 
                    w="100%" 
                    bg="transparent" 
                    _hover={{ bg: "blue.100", cursor: "pointer" }} 
                    _active={{ bg: "blue.200" }}
                >
                    <CardBody onClick={() => handleItemClick(asset)}>
                        <Text fontSize="lg" fontWeight="bold" color="blue.500">
                            {asset.assetTag}
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold">{asset.serialNumber}</Text>
                        <Text fontSize="sm" fontWeight="semibold">{asset.variant}</Text>
                        <Text fontSize="lg" fontWeight="semibold">Status</Text>
                        <Text className={asset.status === 'loaned' ? 'unavailable' : 'available'}>
                            {eventToStatus(asset.status)}
                        </Text>
                        
                        {asset.status === 'loaned' && (
                            <Text fontSize="sm" color="blue.500">
                                {asset.userName}
                            </Text>
                        )}
                    </CardBody>

                    <Button variant="ghost" position="absolute" top={2} right={2} aria-label="Bookmark">
                        {asset.bookmarked === 1 ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                    </Button>
                </Card>
            </Box>
        ))}
        </Cards>
    );
}



export default AssetCards