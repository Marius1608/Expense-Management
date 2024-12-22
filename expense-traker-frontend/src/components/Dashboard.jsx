import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, LinearProgress } from '@mui/material';
import {
  MonetizationOn,
  Assessment,
  Receipt,
  TrendingUp
} from '@mui/icons-material';

const StatCard = ({ icon: Icon, title, value, color, trend }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}08 0%, #ffffff 100%)`,
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }
    }}
  >
    <CardContent sx={{ height: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}15`,
          }}
        >
          <Icon sx={{ fontSize: 28, color: color }} />
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" color="success.main" fontWeight="500">
              +{trend}%
            </Typography>
          </Box>
        )}
      </Box>
      
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        {value}
      </Typography>
      
      <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    monthlyAverage: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const expensesResponse = await fetch('http://localhost:8080/api/expenses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const expenses = await expensesResponse.json();
      
      const total = expenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0);
      
      const currentMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const currentDate = new Date();
        return expenseDate.getMonth() === currentDate.getMonth() &&
               expenseDate.getFullYear() === currentDate.getFullYear();
      });
      const monthlyAvg = currentMonthExpenses.length > 0 ?
        currentMonthExpenses.reduce((sum, expense) => 
          sum + parseFloat(expense.amount), 0) / currentMonthExpenses.length : 0;

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          fontWeight: 600,
          color: 'text.primary'
        }}
      >
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={MonetizationOn}
            title="Total Expenses"
            value={`$${dashboardData.totalExpenses}`}
            color="#2196f3"
            trend="12"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={Assessment}
            title="Monthly Average"
            value={`$${dashboardData.monthlyAverage}`}
            color="#9c27b0"
            trend="8"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={Receipt}
            title="Pending Approvals"
            value={dashboardData.pendingApprovals}
            color="#4caf50"
            trend="5"
          />
        </Grid>
      </Grid>
    </Box>
  );
}