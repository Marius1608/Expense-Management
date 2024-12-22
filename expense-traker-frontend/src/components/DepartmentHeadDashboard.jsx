import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function DepartmentHeadReports() {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState(null);

  useEffect(() => {
    fetchDepartmentInfo();
  }, []);

  const fetchDepartmentInfo = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/current/department', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch department information');
      }

      const data = await response.json();
      setDepartmentInfo(data);
    } catch (error) {
      console.error('Error fetching department info:', error);
      setError('Failed to fetch department information. Please try again later.');
    }
  };

  const generateReport = async () => {
    if (!departmentInfo?.id) {
      setError('Department information not available');
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const response = await fetch(`http://localhost:8080/api/reports/department/${departmentInfo.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          reportType: 'overview'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Department Reports - {departmentInfo?.name || 'Loading...'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} component="form" noValidate>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel htmlFor="start-date" shrink>
                Start Date
              </InputLabel>
              <TextField
                id="start-date"
                name="startDate"
                type="date"
                fullWidth
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                disabled={loading}
                inputProps={{
                  'aria-label': 'Start date for report generation',
                }}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel htmlFor="end-date" shrink>
                End Date
              </InputLabel>
              <TextField
                id="end-date"
                name="endDate"
                type="date"
                fullWidth
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                disabled={loading}
                inputProps={{
                  'aria-label': 'End date for report generation',
                }}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={generateReport}
              disabled={loading || !departmentInfo?.id}
              sx={{ height: '56px' }}
              aria-label="Generate department report"
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" component="p">
                  Total Amount: ${reportData.totalAmount?.toLocaleString() || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" component="p">
                  Total Expenses: {reportData.totalCount?.toLocaleString() || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body1" component="p">
                  Average Amount: ${reportData.averageAmount?.toLocaleString() || 0}
                </Typography>
              </Grid>
            </Grid>

            {reportData.monthlyData && (
              <Box sx={{ mt: 4, height: 300 }} role="region" aria-label="Monthly expenses chart">
                <Typography variant="h6" gutterBottom>
                  Monthly Trends
                </Typography>
                <ResponsiveContainer>
                  <LineChart data={reportData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#8884d8" 
                      name="Amount" 
                      aria-label="Monthly expense amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}