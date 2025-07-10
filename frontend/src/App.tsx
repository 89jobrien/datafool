// frontend/src/App.tsx
import { useState } from 'react';
import { FileUpload } from 'cmp/FileUpload';
import type { UploadSuccessResponse } from 'cmp/FileUpload';
import { QueryInterface } from 'cmp/QueryInterface';
import { ChartRenderer } from 'cmp/ChartRenderer';
import { Container, Typography, CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [uploadInfo, setUploadInfo] = useState<UploadSuccessResponse | null>(null);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to DataFool 🚀
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Get instant answers from your data files.
          </Typography>
        </Box>

        {/* Pass the setter function to FileUpload */}
        <FileUpload onUploadSuccess={setUploadInfo} />

        {/* Conditionally render the QueryInterface when we have a table name */}
        {uploadInfo && <QueryInterface tableName={uploadInfo.table_name} />}

        {/* Conditionally render the ChartRenderer when we have a response */}
        {uploadInfo && <ChartRenderer data={uploadInfo} />}

      </Container>
    </ThemeProvider>
  );
}

export default App;