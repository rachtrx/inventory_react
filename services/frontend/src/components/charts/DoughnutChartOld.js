import { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { Box, Skeleton, Text, Heading } from '@chakra-ui/react';

export default function DoughnutChart({ chartDetails, title, value }) {
  const canvasRef = useRef(null);
  const [isLoading, setLoading] = useState(true); // State to track loading

  useEffect(() => {

    setLoading(true);

    if (!chartDetails || chartDetails.length === 0) {
      setLoading(false);
      return;
    }

    const [data, callbacks] = chartDetails

    let myChart;
    if (canvasRef.current) {
      const el = canvasRef.current.getContext('2d');
      myChart = new Chart(el, {
        // TYPE OF CHART
        type: 'doughnut',
        data: data,
        options: {
          plugins: {
              tooltip: {
                  enabled: true,
                  callbacks: callbacks,
              },
              legend: {
                  display: true,
                  position: 'right',
                  maxWidth: 120,
                  labels: {
                      boxWidth: 10
                  }
              },
              doughnutLabel: {
                  labels: [{
                      text: title,
                      color: "black",
                      font: {
                        size: "10",
                        weight: "bold"
                      }
                  },
                  {
                      text: value,
                      color: "black",
                      font: {
                        size: "13",
                        weight: "bold"
                      }
                  }],
              }
          },
          animation: {
              animateScale: true,
          },
          onHover: (event, elements) => {
            const chartElement = event.native.target;
            if (elements.length > 0) {
              chartElement.style.cursor = 'pointer';
            } else {
              chartElement.style.cursor = 'default';
            }
          }
        }
      });
      setLoading(false);
    }
    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };
  },
  [chartDetails, title, value]);

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
      {isLoading ? (
        <Skeleton height="300px" width="100%" />
      ) : chartDetails && chartDetails.length > 0 ? (
        <canvas ref={canvasRef} />
      ) : (
        <Text>No data to display</Text>
      )}
    </Box>
  );
}