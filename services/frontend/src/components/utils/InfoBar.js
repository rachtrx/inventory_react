import { Text } from '@chakra-ui/react';

function InfoBar({count}) {

    return (
        <Text fontSize={'lg'} align="center">
            {count} Results Found
        </Text>
    )
}

export default InfoBar