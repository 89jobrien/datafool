// frontend/src/components/__tests__/FileUpload.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { FileUpload } from '../FileUpload';

// Mock the entire axios module
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('FileUpload component', () => {
    it('renders the initial upload prompt and the upload button is disabled', () => {
        render(<FileUpload onUploadSuccess={vi.fn()} />);
        expect(screen.getByText(/drag 'n' drop/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /upload file/i })).toBeDisabled();
    });

    it('enables the upload button and displays the filename when a file is selected', async () => {
        render(<FileUpload onUploadSuccess={vi.fn()} />);
        const file = new File(['content'], 'test.csv', { type: 'text/csv' });
        const input = screen.getByTestId('dropzone').querySelector('input[type="file"]');

        fireEvent.change(input!, { target: { files: [file] } });

        const selectedFileText = await screen.findByTestId('selected-file-text');
        expect(selectedFileText).toHaveTextContent('Selected file: test.csv');
        expect(screen.getByRole('button', { name: /upload file/i })).toBeEnabled();
    });

    it('calls onUploadSuccess with response data on a successful upload', async () => {
        const handleUploadSuccess = vi.fn();
        const mockResponse = { data: { table_name: 'test_csv', columns: ['c'], rows: 1, filename: 'test.csv' } };
        mockedAxios.post.mockResolvedValue(mockResponse);

        render(<FileUpload onUploadSuccess={handleUploadSuccess} />);
        const file = new File(['content'], 'test.csv', { type: 'text/csv' });
        const input = screen.getByTestId('dropzone').querySelector('input[type="file"]');

        fireEvent.change(input!, { target: { files: [file] } });
        fireEvent.click(await screen.findByRole('button', { name: /upload file/i }));

        expect(await screen.findByTestId('success-alert')).toBeInTheDocument();
        expect(handleUploadSuccess).toHaveBeenCalledWith(mockResponse.data);
    });

    // THIS IS THE CORRECTED TEST
    it('displays an error message on a failed upload', async () => {
        const errorMessage = 'Upload failed';

        // Simplify the mock to just the part of the object the code uses.
        // Also, explicitly tell mockedAxios that isAxiosError should return true for this object.
        const mockError = {
            response: {
                data: { detail: errorMessage }
            }
        };
        mockedAxios.isAxiosError.mockReturnValue(true);
        mockedAxios.post.mockRejectedValue(mockError);

        render(<FileUpload onUploadSuccess={vi.fn()} />);
        const file = new File(['content'], 'test.csv', { type: 'text/csv' });

        const input = screen.getByTestId('dropzone').querySelector('input[type="file"]');
        fireEvent.change(input!, { target: { files: [file] } });
        fireEvent.click(await screen.findByRole('button', { name: /upload file/i }));

        // Assert that the specific error message is now displayed
        const errorAlert = await screen.findByTestId('error-alert');
        expect(errorAlert).toHaveTextContent(errorMessage);
    });
});