// frontend/src/components/FileUpload.tsx

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, { AxiosError } from 'axios'; // Import AxiosError
import {
    Box, Button, Typography, LinearProgress, Alert, Paper,
    List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { Backup as UploadIcon, CheckCircle as SuccessIcon } from '@mui/icons-material';

export interface UploadSuccessResponse {
    table_name: string;
    columns: string[];
    rows: number;
    filename: string;
}

interface FileUploadProps {
    onUploadSuccess: (response: UploadSuccessResponse) => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadResponse, setUploadResponse] = useState<UploadSuccessResponse | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
            setUploadResponse(null);
            setProgress(0);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

        try {
            const response = await axios.post<UploadSuccessResponse>(`${apiUrl}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const total = progressEvent.total ?? file.size;
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
                    setProgress(percentCompleted);
                },
            });
            setUploadResponse(response.data);
            setError(null);
            onUploadSuccess(response.data);
        } catch (err) {
            // **THIS IS THE CORRECTED ERROR HANDLING LOGIC**
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<{ detail: string }>;
                setError(axiosError.response?.data?.detail || 'An unexpected error occurred.');
            } else {
                setError('An unexpected error occurred.');
            }
            setUploadResponse(null);
        }
    };

    return (
        <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
                Upload Your Data
            </Typography>
            <Box
                {...getRootProps()}
                data-testid="dropzone"
                sx={{
                    border: `2px dashed ${isDragActive ? 'primary.main' : 'grey.500'}`,
                    padding: 6, borderRadius: 2, cursor: 'pointer',
                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                    marginBottom: 2,
                }}
            >
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography>
                    {isDragActive ? 'Drop the file here ...' : "Drag 'n' drop a CSV or Excel file here, or click to select"}
                </Typography>
            </Box>

            {file && (
                <Typography data-testid="selected-file-text" variant="body1" gutterBottom>
                    Selected file: <strong>{file.name}</strong>
                </Typography>
            )}

            <Button variant="contained" onClick={handleUpload} disabled={!file || (progress > 0 && progress < 100)}>
                Upload File
            </Button>

            {progress > 0 && progress < 100 && <LinearProgress variant="determinate" value={progress} sx={{ marginTop: 2 }} />}

            {error && <Alert data-testid="error-alert" severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}

            {uploadResponse && (
                <Alert data-testid="success-alert" severity="success" sx={{ marginTop: 2, textAlign: 'left' }}>
                    <Typography variant="h6">Upload Successful!</Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><SuccessIcon color="success" /></ListItemIcon>
                            <ListItemText primary="Table Created" secondary={uploadResponse.table_name} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><SuccessIcon color="success" /></ListItemIcon>
                            <ListItemText primary="Rows Uploaded" secondary={uploadResponse.rows} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><SuccessIcon color="success" /></ListItemIcon>
                            <ListItemText primary="Columns" secondary={uploadResponse.columns.join(', ')} />
                        </ListItem>
                    </List>
                </Alert>
            )}
        </Paper>
    );
}