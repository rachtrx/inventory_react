import Chart from 'chart.js/auto';
import ChartjsPluginScrollBar from 'chartjs-plugin-scroll-bar';
// import DoughnutLabel from "chartjs-plugin-doughnutlabel-v3";
import DoughnutChart from './DoughnutChart';
import BarChart from './BarChart';
import { useEffect, useState } from 'react';
import { api } from '../../config';
import { API_URL } from '../../config';
import { Box, Container, Flex, Grid, VStack } from '@chakra-ui/react';
import { getDoughnutOptions, getBarOptions } from './config';
import { useLoading } from '../../context/LoadingProvider';
import { convertCamelToTitle } from './utils';

// Chart.register(DoughnutLabel, ChartjsPluginScrollBar);
Chart.register(ChartjsPluginScrollBar);

export default function Stats() {

    const [doughnuts, setDoughnuts] = useState([])
    const [barCharts, setBarCharts] = useState([])
    const { loading, setLoading } = useLoading();

    useEffect(() => {

        setLoading(true);
        const fetchData = async () => {
            try {
                console.log("Fetching data for dashboard");
                const response = await api.get(`${API_URL}/stats`, { withCredentials: true });
                console.log("Axios response received", response);
                const data = response.data;
    
                const newDoughnuts = [];
                const newBarCharts = [];
    
                for (const [chart, details] of Object.entries(data)) {
                    const chartShape = details.chartShape;
                    if (chartShape === 'doughnut') {
                        newDoughnuts.push({
                            title: chart,  // Assuming chart name is used as title
                            data: details.data,
                            options: getDoughnutOptions(chart, details.agg, details.isCurrency),
                        });
                    } else {
                        newBarCharts.push({
                            title: chart,
                            data: details.data,
                            options: getBarOptions(chart, details.isCurrency),
                        });
                    }
                }
    
                setDoughnuts(newDoughnuts);
                setBarCharts(newBarCharts);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
            setLoading(false);
        };
    
        fetchData();
    }, []);

    return (
        <VStack spacing={8}>
            {/* Responsive Doughnut Charts Grid */}
            <Grid
                templateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                width="100%"
                gap={6}
                px={{ base: 4, md: 8 }}
                py={4}
            >
            {doughnuts.map((doughnut, index) => (
                // Wrap each doughnut chart in a Box that prevents overflow
                <Box key={index} overflow="hidden">
                    <DoughnutChart
                        loading={loading}
                        data={doughnut.data}
                        options={doughnut.options}
                        title={convertCamelToTitle(doughnut.title)}
                    />
                </Box>
            ))}
            </Grid>

            {/* Responsive Bar Charts Flex container */}
            <Flex wrap="wrap" justify="center" gap={6}>
                {barCharts.map((barChart, index) => (
                    <Box
                        key={index}
                        flex="1 1 500px"
                        maxW="650px"
                        minW="250px"
                        overflow="hidden"
                    >
                    <BarChart
                        loading={loading}
                        data={barChart.data}
                        options={barChart.options}
                        title={convertCamelToTitle(barChart.title)}
                    />
                </Box>
            ))}
            </Flex>

        </VStack>
    );
}