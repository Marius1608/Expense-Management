import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function ExpenseRequest() {
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [categories] = useState([
    { id: 1, name: 'Transport' },
    { id: 2, name: 'Equipment' },
    { id: 3, name: 'Office Supplies' },
    { id: 4, name: 'Travel' }
  ]);

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
      CANCELLED: 'default'
    };
    return colors[status] || 'default';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newRequest)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Expense request submitted successfully' });
        setNewRequest({
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchRequests();
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit expense request' });
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/expenses/user/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Box>
      {/* New Request Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submit New Expense Request
        </Typography>
        
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Description"
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Amount"
                value={newRequest.amount}
                onChange={(e) => setNewRequest({...newRequest, amount: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                label="Category"
                value={newRequest.category}
                onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Date"
                value={newRequest.date}
                onChange={(e) => setNewRequest({...newRequest, date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Submit Request
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Request History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          My Expense Requests
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                  <TableCell>{request.description}</TableCell>
                  <TableCell>${request.amount}</TableCell>
                  <TableCell>{request.category?.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
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