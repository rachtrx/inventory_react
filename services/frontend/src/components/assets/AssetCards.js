import { API_URL, eventToStatus } from '../../config';

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
import { useGlobal } from '../../context/GlobalProvider';
import { AssetActionButton, SplitButton } from '../buttons/SplitButton';
import { useState } from 'react';
import ActionButton from '../buttons/ActionButton';
import { formTypes } from '../../context/ModalProvider';
import { ItemLink } from '../buttons/ItemLink';
import { ResponsiveText } from '../utils/ResponsiveText';



function AssetCards({items}) {
    const { handleItemClick } = useDrawer()
    const { handleAssetToggle } = useGlobal()

    const [hoveredAssetId, setHoveredAssetId] = useState(null);
    
    return (
        <Cards>
            {items.map((asset) => (
            <Box key={asset.id}>
                <Card 
                    h="100%" 
                    w="100%" 
                    bg="transparent" 
                    _hover={{
                        bg: hoveredAssetId === asset.id ? 'gray.50' : 'gray.100',
                    }}
                    _active={{ bg: hoveredAssetId === asset.id ? 'gray.50' : 'gray.200', }}
                >
                    <CardBody onClick={() => handleItemClick(asset)}>
                        <VStack align="start">
                            <ItemLink item={asset} size={'lg'} fontWeight="bold" setHoveredFn={setHoveredAssetId}/>
                            <Flex height="100%" width={"100%"} justifyContent={'space-between'}>
                                <VStack align="start">
                                    <Box>
                                        <ResponsiveText fontWeight="semibold" size={'sm'}>{asset.assetType}</ResponsiveText>
                                        <ResponsiveText size={'sm'}>{asset.variant}</ResponsiveText>
                                    </Box>
                                    {asset.user && <ItemLink item={asset.user}/>}
                                </VStack>
                                <Flex alignItems={'flex-end'}>
                                    <ActionButton formType={asset.user ? formTypes.RETURN : asset.deletedDate ? formTypes.RESTORE_ASSET : formTypes.LOAN} item={asset} />
                                </Flex>
                            </Flex>
                            
                        </VStack>
                    </CardBody>

                    <StarButton
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