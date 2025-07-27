import { 
    Card,
    CardBody,
    Box,
    Flex,
    VStack,
    Text,
} from "@chakra-ui/react";
import Cards from '../utils/Cards';
import { ItemStarButton } from '../buttons/StarButton';
import { AssetLink, UserLink } from '../buttons/ItemLink';
import { CardActions } from './CardActions';
import { Tags } from '../tags/Tags';

function AssetCards({items}) {

    console.log(items);
    
    return (
        <Cards>
            {items.map((asset) => (
            <Box key={asset.assetId}>
                <Card 
                    h="100%"
                    w="100%" 
                    bg="transparent" 
                    _hover={{ bg:  'gray' }}
                    overflow="hidden"
                >
                    <CardBody>
                        <Flex>
                            <VStack align="start" flex='1'>
                                <AssetLink asset={asset} size={'lg'} fontWeight="bold"/>
                                <Box>
                                    <Text fontWeight="semibold" fontSize={'sm'}>{asset.typeName}</Text>
                                    <Text fontSize={'sm'}>{asset.subTypeName}</Text>
                                </Box>
                                {asset.loan && <UserLink 
                                    user={asset.loan.user} 
                                />}
                                <Tags tags={asset.tags} textSize="xs"/>
                            </VStack>
                            
                            <ItemStarButton
                                id={asset.assetId}
                                isBookmarked={asset.bookmarked}
                            />
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