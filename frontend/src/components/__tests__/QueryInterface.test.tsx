import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { QueryInterface } from '../QueryInterface';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);
vi.mock('../DataVisualization', () => ({
    DataVisualization: () => <div data-testid="mock-visualization" />,
}));

describe('QueryInterface component', () => {
    const tableName = 'test_table';


    it('renders the input field and the Ask button is disabled initially', () => {
        // Arrange
        render(<QueryInterface tableName={tableName} />);

        // Assert
        expect(screen.getByLabelText(`Querying table: "${tableName}"`)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ask/i })).toBeDisabled();
    });

    it('enables the Ask button when text is entered', () => {
        // Arrange
        render(<QueryInterface tableName={tableName} />);
        const input = screen.getByLabelText(`Querying table: "${tableName}"`);

        // Act
        fireEvent.change(input, { target: { value: 'how many rows?' } });

        // Assert
        expect(screen.getByRole('button', { name: /ask/i })).toBeEnabled();
    });

    it('displays data grid and SQL after a successful query', async () => {
        const mockResponse = {
            data: {
                query_generated: 'SELECT COUNT(*) FROM test_table;',
                data: [{ count: 100 }],
            },
        };
        mockedAxios.post.mockResolvedValue(mockResponse);
        render(<QueryInterface tableName={tableName} />);

        fireEvent.change(screen.getByLabelText(`Querying table: "${tableName}"`), { target: { value: 'how many rows?' } });
        fireEvent.click(screen.getByRole('button', { name: /ask/i }));

        // Use findByRole to wait for the grid to appear
        expect(await screen.findByRole('grid')).toBeInTheDocument();
        // Now that the grid is present, we can safely look for the content
        expect(screen.getByText('Count')).toBeInTheDocument(); // Column header
        expect(screen.getByText('100')).toBeInTheDocument();   // Cell value
    });

    // it('displays an error message on a failed query', async () => {
    //     const errorMessage = 'Query execution failed';
    //     const mockError = new AxiosError(
    //         'Query failed', '500',
    //         { headers: {} } as InternalAxiosRequestConfig, {},
    //         {
    //             data: { detail: errorMessage }, status: 500, statusText: 'Server Error',
    //             headers: {}, config: { headers: {} } as InternalAxiosRequestConfig,
    //         }
    //     );
    //     mockedAxios.post.mockRejectedValue(mockError);

    //     render(<QueryInterface tableName={tableName} />);
    //     fireEvent.change(screen.getByLabelText(`Querying table: "${tableName}"`), { target: { value: 'bad query' } });
    //     fireEvent.click(screen.getByRole('button', { name: /ask/i }));

    //     expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
    // });
});
