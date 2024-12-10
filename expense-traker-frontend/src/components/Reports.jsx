// src/components/Reports.jsx
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState(null);

  const generateReport = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dateRange)
      });
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Report
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({
                ...dateRange,
                startDate: e.target.value
              })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({
                ...dateRange,
                endDate: e.target.value
              })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={generateReport}
              sx={{ height: '56px' }}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Results
          </Typography>
          {/* Display report data here */}
          <pre>{JSON.stringify(reportData, null, 2)}</pre>
        </Paper>
      )}
    </Box>
  );
}