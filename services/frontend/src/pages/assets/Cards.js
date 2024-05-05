import React from 'react';
import { API_URL, eventToStatus } from '../../config';

import { 
    VStack,
    Card,
    CardBody,
    Link,
    Text,
    IconButton,
} from "@chakra-ui/react";

import IconBookmark from '../components/icons/IconBookmark';

function Cards({assets}) {

    return (
        <VStack spacing={4}>
        {assets.map((asset) => (
            <Card key={asset.assetId} data-asset-id={asset.assetId}>
            <CardBody>
                <Link href={`${API_URL}views/show_device#${asset.assetId}`} isExternal>
                <Text fontSize="xl" fontWeight="bold">{asset.assetTag}</Text>
                <Text fontSize="md">{asset.serialNumber}</Text>
                <Text fontSize="md">{asset.modelName}</Text>
                </Link>

                <Text fontSize="lg" fontWeight="semibold">Status</Text>
                <Text className={asset.status === 'loaned' ? 'unavailable' : 'available'}>
                {eventToStatus(asset.status)}
                </Text>
                
                {asset.status === 'loaned' && (
                <>
                    <Text fontSize="md" fontWeight="semibold">User</Text>
                    <Link href={`views/show_user#${asset.userId}`} isExternal>
                    <Text>{asset.userName}</Text>
                    </Link>
                </>
                )}
            </CardBody>

            <IconButton
                aria-label="Bookmark"
                icon={asset.bookmarked === 1 ? <IconBookmark fill={true} /> : <IconBookmark />}
                variant="ghost"
                position="absolute"
                top={2}
                right={2}
            />
            </Card>
        ))}
        </VStack>
    );
}



export default Cards