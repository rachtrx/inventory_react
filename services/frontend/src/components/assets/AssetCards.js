import { API_URL } from '../../config';

import { 
    Card,
    CardBody,
    Text,
    Button,
    Box,
    Flex,
    VStack,
} from "@chakra-ui/react";
import { FaBookmark as BookmarkFilledIcon, FaRegBookmark as BookmarkIcon } from 'react-icons/fa';
import Cards from '../utils/Cards';
import { useDrawer } from '../../context/DrawerProvider';
import StarButton from '../buttons/StarButton';
import { useItems } from '../../context/ItemsProvider';
import { AssetActionButton, SplitButton } from '../users/AssetList';
import { useState } from 'react';
import ActionButton from '../buttons/ActionButton';
import { formTypes } from '../../context/ModalProvider';
import { ItemLink } from '../buttons/ItemLink';
import { ResponsiveText } from '../utils/ResponsiveText';
import { CardActions } from './CardActions';
import SharedButton from '../buttons/SharedButton';

function AssetCards({items}) {
    
    return (
        <Cards>
            {items.map((asset) => (
            <Box key={asset.id}>
                <Card 
                    h="100%" 
                    w="100%" 
                    bg="transparent" 
                    _hover={{ bg:  'gray.100' }}
                    overflow="hidden"
                >
                    <CardBody>  {/*onClick={() => handleItemClick(asset)} */}
                        <Flex>
                            <VStack align="start" flex='1'>
                                <ItemLink item={asset} size={'lg'} fontWeight="bold"/>
                                <Box>
                                    <ResponsiveText fontWeight="semibold" size={'sm'}>{asset.assetType}</ResponsiveText>
                                    <ResponsiveText size={'sm'}>{asset.variant}</ResponsiveText>
                                </Box>
                                <Box display="inline-flex" flexWrap="wrap" gap={2}>
                                    {asset.users && asset.users.map((user) => (
                                        <ItemLink key={user.id} item={user} />
                                    ))}
                                </Box>
                            </VStack>
                            
                            <VStack alignSelf='flex-start'>
                                <StarButton
                                    id={asset.id}
                                    isBookmarked={asset.bookmarked}
                                />
                                <SharedButton
                                    id={asset.id}
                                    isShared={asset.shared}
                                    userCount={asset.users?.length || 0}
                                />
                            </VStack>
                        </Flex>
                    </CardBody>
                    
                    
                    <CardActions asset={asset} flex='1' borderRadius='0'/>
                </Card>
            </Box>
        ))}
        </Cards>
    );
}



export default AssetCards