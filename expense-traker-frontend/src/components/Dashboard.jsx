import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  MonetizationOn,
  Assessment,
  Receipt
} from '@mui/icons-material';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    monthlyAverage: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total expenses
      const expensesResponse = await fetch('http://localhost:8080/api/expenses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const expenses = await expensesResponse.json();
      
      // Calculate total expenses
      const total = expenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0);
      
      // Calculate monthly average (using current month's data)
      const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const currentDate = new Date();
        return expenseDate.getMonth() === currentDate.getMonth() &&
               expenseDate.getFullYear() === currentDate.getFullYear();
      });
      const monthlyAvg = currentMonthExpenses.length > 0 ?
        currentMonthExpenses.reduce((sum, expense) => 
          sum + parseFloat(expense.amount), 0) / currentMonthExpenses.length : 0;

      // Fetch pending approvals
      const pendingResponse = await fetch('http://localhost:8080/api/expenses/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const pendingExpenses = await pendingResponse.json();

      setDashboardData({
        totalExpenses: total.toFixed(2),
        monthlyAverage: monthlyAvg.toFixed(2),
        pendingApprovals: pendingExpenses.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <MonetizationOn sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">Total Expenses</Typography>
            <Typography variant="h4">${dashboardData.totalExpenses}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Assessment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h6">Monthly Average</Typography>
            <Typography variant="h4">${dashboardData.monthlyAverage}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Receipt sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h6">Pending Approvals</Typography>
            <Typography variant="h4">{dashboardData.pendingApprovals}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}