import React from 'react';
import { Text } from '@chakra-ui/react';
import { useResponsive } from '../../context/ResponsiveProvider';

export const ResponsiveText = ({ size='sm', children, copyText=false, ...props }) => {
    const { xs, sm, md, lg } = useResponsive();

    const fontSizeMap = {
        'xs': xs, 
        'sm': sm,
        'md': md,
        'lg': lg
    };

    return (
        <Text fontSize={fontSizeMap[size]} {...props}>
            {children}
        </Text>
    );
};