import { Heading } from '@chakra-ui/react';
import { useResponsive } from '../../context/ResponsiveProvider';

function InfoBar({count}) {
    const { headerSize, textSize } = useResponsive()

    return (
        <Heading as="h5" size={textSize}>
            {count} Results Found
        </Heading>
    )
}

export default InfoBar