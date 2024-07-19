import { useRef, useEffect, useState } from 'react';
import { Box, Skeleton, Text, Heading } from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';

export default function BarChart({ loading, data, options, title }) { // popularModelsData

    return (
        <Box
            w="100%"
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            boxShadow="md"
            minHeight="300px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            mb={6}
        >
            <Heading>{title}</Heading>
            {loading ? (
                <Skeleton height="300px" width="100%" />
            ) : data ? (<Bar data={data} options={options} />) : (
                <Text>No data to display</Text>
            )}
        </Box>
        
    );
}