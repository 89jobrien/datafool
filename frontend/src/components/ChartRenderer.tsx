// frontend/src/components/ChartRenderer.tsx

import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement,
} from 'chart.js';
import type { ChartRendererProps } from '@/definitions/interfaces';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend
);



export function ChartRenderer({ chartType, data, options }: ChartRendererProps) {
    switch (chartType) {
        case 'bar':
            return <Bar options={options} data={data} />;
        case 'line':
            return <Line options={options} data={data} />;
        case 'pie':
            return <Pie options={options} data={data} />;
        case 'scatter':
            return <Scatter options={options} data={data} />;
        default:
            return null;
    }
}