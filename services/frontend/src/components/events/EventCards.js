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
import { ItemStarButton } from '../buttons/StarButton';
import { AccTypeLink, AssetLink, UserLink } from '../buttons/ItemLink';
import { ResponsiveText } from '../utils/ResponsiveText';
// import { CardActions } from './CardActions';
import { Tags } from '../tags/Tags';
import { ACTION_COLORS } from '../buttons/constants';

function EventCards({items}) {
    
    return (
        <Cards>
            {items.map((event) => (
            <Box key={event.eventId}>
                <Card 
                    h="100%"
                    w="100%" 
                    bg={`${ACTION_COLORS[event.type]}.100`}
                    _hover={{ bg:  'gray.100' }}
                    overflow="hidden"
                >
                    <CardBody>
                        <Flex>
                            <VStack align="start" flex='1'>
                                <ResponsiveText>{event.eventDate}</ResponsiveText>
                                <ResponsiveText>{event.adminName}</ResponsiveText>
                                {event.asset && <AssetLink asset={event.asset} size='sm'/>}
                                {event.user && <UserLink 
                                    user={event.user} 
                                />}
                                {event.accessories && Array.isArray(event.accessories) && (
                                    event.accessories.map(({ accessoryType, count }, idx) => (
                                        <AccTypeLink key={idx} accType={accessoryType} />
                                    ))
                                )}
                                {event.tags && <Tags tags={event.tags} textSize="xs"/>}
                            </VStack>
                            
                            <ItemStarButton
                                id={event.eventId}
                                isBookmarked={event.bookmarked}
                            />
                        </Flex>
                    </CardBody>
                    {/* <CardActions asset={asset} flex='1' borderRadius='0'/> */}
                </Card>
            </Box>
        ))}
        </Cards>
    );
}



export default EventCards;