import { API_URL, eventToStatus } from '../../config';

import { 
    Card,
    CardBody,
    Text,
    Button,
    Box,
} from "@chakra-ui/react";
import { FaBookmark as BookmarkFilledIcon, FaRegBookmark as BookmarkIcon } from 'react-icons/fa';
import Cards from '../utils/Cards';
import { useDrawer } from '../../context/DrawerProvider';
import StarToggle from '../utils/StarToggle';
import { useGlobal } from '../../context/GlobalProvider';

function AssetCards({items}) {
    const { handleItemClick } = useDrawer()
    const { handleAssetToggle } = useGlobal()
    
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

                    <StarToggle
                        position="absolute" top={2} right={2}
                        id={asset.id}
                        isBookmarked={asset.bookmarked}
                        onToggle={handleAssetToggle}
                    />
                </Card>
            </Box>
        ))}
        </Cards>
    );
}



export default AssetCards