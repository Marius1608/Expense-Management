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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function DepartmentHeadDashboard() {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/expenses/department/${user?.department?.id}/pending`);
      const data = await response.json();
      setPendingExpenses(data);
    } catch (error) {
      console.error('Error fetching pending expenses:', error);
    }
  };

  const handleApproveReject = async (expenseId, status) => {
    try {
      const response = await fetch(`http://localhost:8080/api/expenses/${expenseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, comment })
      });

      if (response.ok) {
        setAlert({
          show: true,
          message: `Expense ${status.toLowerCase()} successfully`,
          severity: 'success'
        });
        fetchPendingExpenses();
      }
    } catch (error) {
      setAlert({
        show: true,
        message: 'Error updating expense status',
        severity: 'error'
      });
    }
    setDialogOpen(false);
    setComment('');
  };

  return (
    <Box>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}

      <Typography variant="h5" sx={{ mb: 3 }}>
        Department Expenses Approval
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
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
                <TableCell>{expense.user.username}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>${expense.amount}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={expense.status} 
                    color={expense.status === 'PENDING' ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => {
                        setSelectedExpense(expense);
                        setDialogOpen(true);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => {
                        setSelectedExpense({ ...expense, action: 'REJECT' });
                        setDialogOpen(true);
                      }}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedExpense?.action === 'REJECT' ? 'Reject' : 'Approve'} Expense
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleApproveReject(
              selectedExpense.id, 
              selectedExpense?.action === 'REJECT' ? 'REJECTED' : 'APPROVED'
            )}
            color={selectedExpense?.action === 'REJECT' ? 'error' : 'success'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}