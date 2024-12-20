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
  InputLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AccountantReports() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: 'all',
    category: ''
  });
  
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateDates = () => {
    if (!filters.startDate || !filters.endDate) {
      return 'Please select both start and end dates';
    }
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    if (end < start) {
      return 'End date must be after start date';
    }
    if (end > new Date()) {
      return 'End date cannot be in the future';
    }
    return null;
  };

  const handleGenerateReport = async () => {
    try {
      setError('');
      const dateError = validateDates();
      if (dateError) {
        setError(dateError);
        return;
      }

      setLoading(true);
      const response = await fetch('http://localhost:8080/api/accountant/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      reportType: 'all',
      category: ''
    });
    setReportData(null);
    setError('');
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
        Accountant Reports
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
              disabled={loading}
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
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={filters.reportType}
                label="Report Type"
                onChange={(e) => setFilters({
                  ...filters,
                  reportType: e.target.value
                })}
                disabled={loading}
              >
                <MenuItem value="all">All Expenses</MenuItem>
                <MenuItem value="byCategory">By Category</MenuItem>
                <MenuItem value="byStatus">By Status</MenuItem>
                <MenuItem value="byDepartment">By Department</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateReport}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Generate Report'
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilters}
                disabled={loading}
                sx={{ height: '56px', minWidth: '100px' }}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Results
          </Typography>
          
          {renderChart()}

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      ${reportData.totalAmount?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {reportData.transactionCount?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      ${reportData.averageAmount?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Transaction
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  );
}