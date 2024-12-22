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
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

export default function DepartmentHeadReports() {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('overview');
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const validateDates = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return 'Please select both start and end dates';
    }
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    if (end < start) {
      return 'End date must be after start date';
    }
    if (end > new Date()) {
      return 'End date cannot be in the future';
    }
    return null;
  };

  const generateReport = async () => {
    try {
        const dateError = validateDates();
        if (dateError) {
            setError(dateError);
            return;
        }

        // Verificăm dacă avem un department ID valid
        if (!user?.department?.id) {
            setError('Department ID not found');
            return;
        }

        setError('');
        setLoading(true);

        const response = await fetch(`http://localhost:8080/api/reports/department/${user.department.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                reportType 
            })
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
    setDateRange({ startDate: '', endDate: '' });
    setReportType('overview');
    setReportData(null);
    setError('');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {user?.department?.name || 'Department'} Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="overview">Overview</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={generateReport}
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expense Summary
                </Typography>
                <Typography variant="h4">
                  Total Expenses: ${reportData.totalAmount?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Number of Expenses: {reportData.totalCount?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body1">
                  Average Expense: ${reportData.averageAmount?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Expenses Trend
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8884d8" 
                        name="Monthly Expenses"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expenses by Category
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar 
                        dataKey="amount" 
                        fill="#8884d8" 
                        name="Expense Amount"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}