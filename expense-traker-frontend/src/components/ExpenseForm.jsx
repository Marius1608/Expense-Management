import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  MenuItem
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExpenseForm() {
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }
 
        const formattedData = {
            description: expenseData.description,
            amount: parseFloat(expenseData.amount),
            date: new Date(expenseData.date).toISOString(),
            status: 'PENDING',
            category: {
                id: parseInt(expenseData.categoryId)
            }
        };
 
        const response = await fetch('http://localhost:8080/api/expenses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formattedData)
        });
 
        if (response.status === 403) {
            console.error('Access forbidden - insufficient permissions');
            return;
        }
 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
 
        const data = await response.json();
        navigate('/expenses');
    } catch (error) {
        console.error('Failed to create expense:', error.message);
    }
 };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          New Expense
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                value={expenseData.description}
                onChange={(e) => setExpenseData({
                  ...expenseData,
                  description: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Amount"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({
                  ...expenseData,
                  amount: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Date"
                value={expenseData.date}
                onChange={(e) => setExpenseData({
                  ...expenseData,
                  date: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                required
                fullWidth
                label="Category"
                value={expenseData.categoryId}
                onChange={(e) => setExpenseData({
                  ...expenseData,
                  categoryId: e.target.value
                })}
              >
                <MenuItem value="1">Travel</MenuItem>
                <MenuItem value="2">Office Supplies</MenuItem>
                <MenuItem value="3">Equipment</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/expenses')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}