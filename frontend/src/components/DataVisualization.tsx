// frontend/src/components/QueryInterface.tsx

import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { ChartRenderer } from './ChartRenderer';
import type { ChartData, ChartOptions } from 'chart.js';
import type { DataVisualizationProps } from 'ifaces';

export function DataVisualization({ data }: DataVisualizationProps) {
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | ''>('');
    const [xAxis, setXAxis] = useState<string>('');
    const [yAxis, setYAxis] = useState<string>('');

    // Extract all possible column names from the data
    const columnNames = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);


    // Effect to suggest initial chart type and axes
    useEffect(() => {
        if (data.length > 0) {
            const numericColumns = columnNames.filter(key => typeof data[0][key] === 'number');
            const categoricalColumns = columnNames.filter(key => typeof data[0][key] === 'string' || typeof data[0][key] === 'boolean');

            if (numericColumns.length >= 2) {
                setXAxis(numericColumns[0]);
                setYAxis(numericColumns[1]);
                setChartType('scatter'); // Default for two numeric columns
            } else if (categoricalColumns.length >= 1 && numericColumns.length >= 1) {
                setXAxis(categoricalColumns[0]);
                setYAxis(numericColumns[0]);
                setChartType('bar'); // Default for one categorical and one numeric
            } else if (numericColumns.length === 1 && data.length > 1) {
                setXAxis(numericColumns[0]);
                setChartType('line'); // Default for single numeric column over time/index
            }
        }
    }, [data, columnNames]);


    const handleChartTypeChange = (event: SelectChangeEvent<string>) => {
        setChartType(event.target.value as 'bar' | 'line' | 'pie' | 'scatter' | '');
    };

    const handleXAxisChange = (event: SelectChangeEvent<string>) => {
        setXAxis(event.target.value);
    };

    const handleYAxisChange = (event: SelectChangeEvent<string>) => {
        setYAxis(event.target.value);
    };

    const generateChartData = (): ChartData | null => {
        if (!chartType || data.length === 0 || !xAxis || (chartType !== 'pie' && !yAxis && chartType !== 'line')) {
            return null;
        }

        let labels: (string | number)[] = [];
        // let datasetData: (string | number | boolean | null)[] = [];
        let datasetData: number[] = [];
        let backgroundColor: string[] = [];

        // For bar, line, scatter charts
        if (xAxis && yAxis && (chartType === 'bar' || chartType === 'line')) {
            labels = data.map(row => row[xAxis] as string | number);
            datasetData = data.map(row => row[yAxis] as number);
            return {
                labels: labels,
                datasets: [
                    {
                        label: yAxis,
                        data: datasetData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            };
        } else if (chartType === 'scatter' && xAxis && yAxis) {
            // Scatter chart data format is different
            const scatterData = data.map(row => ({
                x: row[xAxis] as number,
                y: row[yAxis] as number,
            }));
            return {
                datasets: [
                    {
                        label: `${yAxis} vs ${xAxis}`,
                        data: scatterData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                ],
            };
        }
        else if (chartType === 'line' && xAxis) { // If only X-axis is selected for line chart
            labels = data.map((_, index) => index); // Use index as labels
            datasetData = data.map(row => row[xAxis] as number);
            return {
                labels: labels,
                datasets: [
                    {
                        label: xAxis,
                        data: datasetData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false,
                    },
                ],
            };
        }
        else if (chartType === 'pie' && xAxis) { // For pie chart, xAxis represents the category, yAxis (implicitly) the value
            const aggregatedData: { [key: string]: number } = {};
            data.forEach(row => {
                const category = String(row[xAxis]);
                const value = typeof row[yAxis || columnNames[0]] === 'number' ? (row[yAxis || columnNames[0]] as number) : 1; // Default to 1 for count
                aggregatedData[category] = (aggregatedData[category] || 0) + value;
            });

            labels = Object.keys(aggregatedData);
            datasetData = Object.values(aggregatedData);
            backgroundColor = labels.map((_, index) => `hsl(${(index * 30) % 360}, 70%, 70%)`);

            return {
                labels: labels,
                datasets: [
                    {
                        data: datasetData,
                        backgroundColor: backgroundColor,
                        hoverOffset: 4,
                    },
                ],
            };
        }

        return null;
    };

    const chartData = generateChartData();

    const chartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
            },
        },
        scales: chartType === 'bar' || chartType === 'line' || chartType === 'scatter' ? {
            x: {
                title: {
                    display: true,
                    text: xAxis,
                },
                type: (typeof data[0]?.[xAxis] === 'number' && chartType === 'scatter') ? 'linear' : 'category',
            },
            y: {
                title: {
                    display: true,
                    text: yAxis,
                },
                type: (typeof data[0]?.[yAxis] === 'number' && chartType === 'scatter') ? 'linear' : 'linear',
            },
        } : {},
    };

    return (
        <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
            <Typography variant="h5" gutterBottom>
                Data Visualization
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, marginBottom: 3, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="chart-type-label">Chart Type</InputLabel>
                    <Select
                        labelId="chart-type-label"
                        value={chartType}
                        label="Chart Type"
                        onChange={handleChartTypeChange}
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="bar">Bar Chart</MenuItem>
                        <MenuItem value="line">Line Chart</MenuItem>
                        <MenuItem value="pie">Pie Chart</MenuItem>
                        <MenuItem value="scatter">Scatter Plot</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="x-axis-label">X-Axis</InputLabel>
                    <Select
                        labelId="x-axis-label"
                        value={xAxis}
                        label="X-Axis"
                        onChange={handleXAxisChange}
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {columnNames.map((name) => (
                            <MenuItem key={name} value={name}>{name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {chartType !== 'pie' && ( // Y-axis is not typically used for pie charts as a separate selection
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel id="y-axis-label">Y-Axis</InputLabel>
                        <Select
                            labelId="y-axis-label"
                            value={yAxis}
                            label="Y-Axis"
                            onChange={handleYAxisChange}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {columnNames.map((name) => (
                                <MenuItem key={name} value={name}>{name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>

            {chartType && chartData ? (
                <Box sx={{ height: 400, width: '100%' }}>
                    <ChartRenderer chartType={chartType} data={chartData} options={chartOptions} />
                </Box>
            ) : (
                <Typography variant="body1" color="text.secondary">
                    Select a chart type and axes to visualize your data.
                </Typography>
            )}
            {!chartData && chartType && (
                <Alert severity="warning" sx={{ marginTop: 2 }}>
                    Please select appropriate X and Y axes for the chosen chart type.
                </Alert>
            )}
        </Paper>
    );
}