import { API_URL, eventToStatus } from '../../config';

import { 
    Card,
    CardBody,
    Link,
    Text,
    Button,
} from "@chakra-ui/react";
import { FaBookmark as BookmarkFilledIcon, FaRegBookmark as BookmarkIcon } from 'react-icons/fa';
import Cards from '../Cards';
import { useAsset } from '../../context/AssetProvider';

function AssetCards({items}) {
    const { setCurrentAsset } = useAsset()
    
    return (
        <Cards>
        {items.map((asset) => (
            <Card key={asset.id} data-asset-id={asset.id}>
            <CardBody>
                <Link href={`${API_URL}views/show_device#${asset.id}`} isExternal>
                <Text fontSize="xl" fontWeight="bold">{asset.assetTag}</Text>
                <Text fontSize="md">{asset.serialNumber}</Text>
                <Text fontSize="md">{asset.modelName}</Text>
                </Link>

                <Text fontSize="lg" fontWeight="semibold">Status</Text>
                <Text className={asset.status === 'loaned' ? 'unavailable' : 'available'}>
                {eventToStatus(asset.status)}
                </Text>
                
                {asset.status === 'loaned' && (
                    <Button onClick={() => setCurrentAsset(asset.id)} colorScheme="blue">
                        {asset.userName}
                    </Button>
                )}
            </CardBody>

            <Button variant="ghost" position="absolute" top={2} right={2} aria-label="Bookmark">
                {asset.bookmarked === 1 ? <BookmarkFilledIcon /> : <BookmarkIcon />}
            </Button>
            </Card>
        ))}
        </Cards>
    );
}



export default AssetCards