import { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { Box, Skeleton, Text, Heading } from '@chakra-ui/react';
import { Doughnut } from 'react-chartjs-2';

export default function DoughnutChart({ loading, data, options, title }) {

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
    >
      <Heading>{title}</Heading>
      {loading ? (
        <Skeleton height="300px" width="100%" />
      ) : data ? (<Doughnut data={data} options={options} />) : (
        <Text>No data to display</Text>
      )}
    </Box>
  );
}