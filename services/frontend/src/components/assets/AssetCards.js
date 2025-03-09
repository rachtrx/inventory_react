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
import Cards from '../utils/Cards';
import StarButton from '../buttons/StarButton';
import { AssetLink, UserLink } from '../buttons/ItemLink';
import { ResponsiveText } from '../utils/ResponsiveText';
import { CardActions } from './CardActions';
import Tags from '../tags/Tags';

function AssetCards({items}) {
    
    return (
        <Cards>
            {items.map((asset) => (
            <Box key={asset.assetId}>
                <Card 
                    h="100%"
                    w="100%" 
                    bg="transparent" 
                    _hover={{ bg:  'gray.100' }}
                    overflow="hidden"
                >
                    <CardBody>
                        <Flex>
                            <VStack align="start" flex='1'>
                                <AssetLink asset={asset} size={'lg'} fontWeight="bold"/>
                                <Box>
                                    <ResponsiveText fontWeight="semibold" size={'sm'}>{asset.typeName}</ResponsiveText>
                                    <ResponsiveText size={'sm'}>{asset.subTypeName}</ResponsiveText>
                                </Box>
                                {asset.ongoingLoan && <UserLink 
                                    user={asset.ongoingLoan.user} 
                                />}
                                <Tags tags={asset.tags}/>
                            </VStack>
                            
                            <StarButton
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