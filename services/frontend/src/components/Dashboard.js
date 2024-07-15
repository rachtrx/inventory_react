import Chart from 'chart.js/auto';
import ChartjsPluginScrollBar from 'chartjs-plugin-scroll-bar';
// import DoughnutLabel from "chartjs-plugin-doughnutlabel-v3";
import DoughnutChart from './charts/DoughnutChart';
import BarChart from './charts/BarChart';
import { useEffect, useState } from 'react';
import { axiosInstance } from '../context/AuthProvider';
import { API_URL } from '../config';
import { Container, Grid, VStack } from '@chakra-ui/react';
import { getDoughnutOptions, getBarOptions } from './charts/config';

// Chart.register(DoughnutLabel, ChartjsPluginScrollBar);
Chart.register(ChartjsPluginScrollBar);

export default function Dashboard() {

    const [doughnuts, setDoughnuts] = useState([])
    const [barCharts, setBarCharts] = useState([])
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {

        setLoading(true);
        const fetchData = async () => {
            try {
                console.log("Fetching data for dashboard");
                const response = await axiosInstance.get(`${API_URL}/dashboard`, { withCredentials: true });
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
                // Handle error state if necessary
            }
            setLoading(false);
        };
    
        fetchData();
    }, []);

    return (
        <VStack spacing={8}> {/* Vertical Stack with spacing between children */}
            {/* Doughnut Charts in a 2-row x 3-column formation */}
            <Grid templateColumns="repeat(3, 1fr)" width="100%" gap={6} px={{ base: 4, md: 8 }} py={4}>
            {doughnuts.map((doughnut, index) => (
                <DoughnutChart
                    key={index}
                    isLoading={isLoading}
                    data={doughnut.data}
                    options={doughnut.options}
                    title={doughnut.title}
                />
            ))}
            </Grid>
        
            {/* Bar Charts each taking up about 70% of the middle */}
            <Container maxW="70%" centerContent>
            {barCharts.map((barChart, index) => (
                <BarChart
                    key={index}
                    data={barChart.data}
                    options={barChart.options}
                    title={barChart.title}
                />
            ))}
            </Container>
        </VStack>
    );
}