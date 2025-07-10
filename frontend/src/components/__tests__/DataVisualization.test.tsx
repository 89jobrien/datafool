// frontend/src/components/__tests__/DataVisualization.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataVisualization } from '../DataVisualization';

// Mock the chart components
vi.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="bar-chart" />,
    Line: () => <div data-testid="line-chart" />,
    Pie: () => <div data-testid="pie-chart" />,
    Scatter: () => <div data-testid="scatter-chart" />,
}));

describe('DataVisualization component', () => {
    const mockData = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
    ];

    it('renders a bar chart by default with valid data', () => {
        render(<DataVisualization data={mockData} />);
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('switches to a line chart when selected from the dropdown', () => {
        render(<DataVisualization data={mockData} />);
        // The Material-UI Select has a role of 'combobox' and is associated with a label.
        fireEvent.mouseDown(screen.getByLabelText(/chart type/i));
        fireEvent.click(screen.getByRole('option', { name: /line/i }));
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    // This test is corrected
    it('renders a placeholder if data is empty', () => {
        // The component now correctly renders an info alert for empty data.
        render(<DataVisualization data={[]} />);
        expect(screen.getByText(/cannot be visualized effectively/i)).toBeInTheDocument();
    });

    it('renders a placeholder if data has insufficient columns', () => {
        render(<DataVisualization data={[{ col1: 'A' }, { col1: 'B' }]} />);
        expect(screen.getByText(/cannot be visualized effectively/i)).toBeInTheDocument();
    });
});