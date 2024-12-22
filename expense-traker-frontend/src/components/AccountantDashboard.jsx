import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  Menu as MenuIcon,
  CheckCircle,
  Cancel as RejectIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

export default function AccountantDashboard() {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalApproved: 0,
    totalPending: 0,
    monthlyTotal: 0,
    averageProcessingTime: 0
  });

  const handleApprove = async (expenseId) => {
    try {
      await fetch(`http://localhost:8080/api/expenses/${expenseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      fetchPendingExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleReject = async (expenseId) => {
    try {
      await fetch(`http://localhost:8080/api/expenses/${expenseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      // Refresh expenses list
      fetchPendingExpenses();
    } catch (error) {
      console.error('Error rejecting expense:', error);
    }
  };

  const fetchPendingExpenses = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/expenses/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPendingExpenses(data);
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
    }
  };

  useEffect(() => {
    fetchPendingExpenses();
    // Fetch statistics
    // This would be implemented in your backend
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Accountant Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Approvals</Typography>
              </Box>
              <Typography variant="h4">{stats.totalPending}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Approved This Month</Typography>
              </Box>
              <Typography variant="h4">{stats.totalApproved}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Monthly Total</Typography>
              </Box>
              <Typography variant="h4">${stats.monthlyTotal}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Pending Expense Requests
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.user?.username}</TableCell>
                  <TableCell>{expense.department?.name}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>${expense.amount}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={expense.status}
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(expense.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleReject(expense.id)}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}