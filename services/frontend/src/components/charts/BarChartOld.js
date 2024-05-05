import { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import { Box, Skeleton, Text } from '@chakra-ui/react';

export default function BarChart({chartDetails, indexAxis, display}) { // popularModelsData

    const canvasRef = useRef(null);
    const [isLoading, setLoading] = useState(true); // State to track loading

    useEffect(() => {

        setLoading(true);

        if (!chartDetails || chartDetails.length === 0) {
            setLoading(false);
            return;
        }

        const [data, callbacks, scales, scrollBar] = chartDetails

        console.log(scrollBar);

        let myChart;
        if (canvasRef.current) {
            const el = canvasRef.current.getContext('2d');
            myChart = new Chart(el, {
                // TYPE OF CHART
                type: 'bar',
                data: data,
                options: {
                    layout: {
                        padding: 20
                    },
                    indexAxis: indexAxis,
                    scales: scales,
                    plugins: {
                        scrollBar: scrollBar,
                        legend: {
                            display: display
                        },
                        tooltip: {
                            callbacks: callbacks,
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
    }, [chartDetails, indexAxis, display]);

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