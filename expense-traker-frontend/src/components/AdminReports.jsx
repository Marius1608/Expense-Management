import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminReports() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: '',
    category: '',
    reportType: 'detailed'
  });
  
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/admin/reports', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReportData(data);
    } catch (error) {
        console.error('Failed to generate report:', error);
        alert('Failed to generate report. Please try again.');
    }
};

  const renderChart = () => {
    if (!reportData?.chartData) return null;

    return (
      <Box sx={{ height: 400, mt: 4 }}>
        <ResponsiveContainer>
          <BarChart data={reportData.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" name="Expense Amount" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Administrative Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => setFilters({
                ...filters,
                startDate: e.target.value
              })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => setFilters({
                ...filters,
                endDate: e.target.value
              })}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={filters.reportType}
                label="Report Type"
                onChange={(e) => setFilters({
                  ...filters,
                  reportType: e.target.value
                })}
              >
                <MenuItem value="detailed">Detailed</MenuItem>
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="byDepartment">By Department</MenuItem>
                <MenuItem value="byCategory">By Category</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              sx={{ height: '56px' }}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Results
          </Typography>
          
          {renderChart()}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Summary Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">
                    ${reportData.totalAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Expenses
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">
                    {reportData.transactionCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  );
}