import { Heading } from '@chakra-ui/react';
import { useResponsive } from '../../context/ResponsiveProvider';
import { ResponsiveText } from './ResponsiveText';

function InfoBar({count}) {

    return (
        <ResponsiveText size={'lg'} flex="2" align="center">
            {count} Results Found
        </ResponsiveText>
    )
}

export default InfoBar