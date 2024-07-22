import React from 'react';
import { Text } from '@chakra-ui/react';
import { useResponsive } from '../../context/ResponsiveProvider';

export const ResponsiveText = ({ size='sm', children, copyText=false, ...props }) => {
    const { sm, md, lg } = useResponsive();

    const fontSizeMap = {
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