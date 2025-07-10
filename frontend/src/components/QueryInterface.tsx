// frontend/src/components/QueryInterface.tsx

import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Typography,
    Paper,
    Alert,
    Collapse,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { Code as CodeIcon } from '@mui/icons-material';
import { DataVisualization } from "cmp/DataVisualization";
import type { QueryResponse } from "api"
import type { QueryInterfaceProps } from "ifaces"

export function QueryInterface({ tableName }: QueryInterfaceProps) {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<QueryResponse | null>(null);
    const [showSql, setShowSql] = useState(false);
    const [showChart, setShowChart] = useState(false); // State to control chart visibility

    const handleQuery = async () => {
        if (!question) return;
        setLoading(true);
        setError(null);
        setResponse(null);
        setShowChart(false); // Reset chart visibility on new query

        try {
            const apiResponse = await axios.post<QueryResponse>('http://127.0.0.1:8000/api/query', {
                table_name: tableName,
                question: question,
            });
            setResponse(apiResponse.data);

            // Condition to show chart: more than 1 row and at least 2 columns
            const isChartable = apiResponse.data.data.length > 1 && Object.keys(apiResponse.data.data[0] || {}).length >= 2;
            setShowChart(isChartable);

        } catch (err) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<{ detail: string }>;
                setError(axiosError.response?.data?.detail || 'An unexpected error occurred.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Dynamically generate columns for the DataGrid
    const columns: GridColDef[] = response?.data[0]
        ? Object.keys(response.data[0]).map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            flex: 1,
            minWidth: 150,
        }))
        : [];

    // Add a unique 'id' to each row for the DataGrid
    const rows = response?.data.map((row, index) => ({ id: index, ...row })) || [];

    return (
        <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
            <Typography variant="h5" gutterBottom>
                Ask a Question About Your Data
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label={`Querying table: "${tableName}"`}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                />
                <Button variant="contained" onClick={handleQuery} disabled={loading || !question}>
                    {loading ? <CircularProgress size={24} /> : 'Ask'}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ marginTop: 2 }}>{error}</Alert>}

            {response && (
                <Box sx={{ marginTop: 3 }}>
                    <Button
                        size="small"
                        onClick={() => setShowSql(!showSql)}
                        startIcon={<CodeIcon />}
                    >
                        {showSql ? 'Hide' : 'Show'} Generated SQL
                    </Button>
                    <Collapse in={showSql}>
                        <Paper elevation={0} variant="outlined" sx={{ padding: 2, backgroundColor: 'action.hover', fontFamily: 'monospace', my: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {response.query_generated}
                        </Paper>
                    </Collapse>

                    <Typography variant="h6" sx={{ my: 2 }}>
                        Results ({rows.length} rows)
                    </Typography>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSizeOptions={[5, 10, 20]}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 5 },
                                },
                            }}
                            density="compact"
                        />
                    </Box>
                </Box>
            )}

            {/* Conditionally render the DataVisualization component */}
            {response && showChart && (
                <DataVisualization data={response.data} />
            )}
        </Paper>
    );
}