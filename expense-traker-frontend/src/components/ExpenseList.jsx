import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { Add as AddIcon, CheckCircle, Cancel as RejectIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comment, setComment] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
  
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setAlert({
        show: true,
        message: 'Failed to fetch expenses',
        severity: 'error'
      });
    }
  };

  const handleStatusUpdate = async (expense, status) => {
    setSelectedExpense({ ...expense, action: status });
    setDialogOpen(true);
  };

  const handleConfirmStatusUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/accountant/expenses/${selectedExpense.id}/status?status=${selectedExpense.action}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ comment })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update expense status');
      }

      setAlert({
        show: true,
        message: `Expense ${selectedExpense.action.toLowerCase()} successfully`,
        severity: 'success'
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense status:', error);
      setAlert({
        show: true,
        message: 'Failed to update expense status',
        severity: 'error'
      });
    }
    setDialogOpen(false);
    setComment('');
    setSelectedExpense(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const canApproveReject = (expense) => {
    return (
      expense.status === 'PENDING' && 
      (user?.role === 'ACCOUNTANT' || user?.role === 'DEPARTMENT_HEAD')
    );
  };

  return (
    <Box>
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Expenses</Typography>
        {user?.role === 'EMPLOYEE' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/expenses/new')}
          >
            Add Expense
          </Button>
        )}
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>   
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.description}</TableCell>
                <TableCell>${expense.amount}</TableCell>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{expense.category?.name}</TableCell>
                <TableCell>
                  <Chip
                    label={expense.status}
                    color={getStatusColor(expense.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {canApproveReject(expense) && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleStatusUpdate(expense, 'APPROVED')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => handleStatusUpdate(expense, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedExpense?.action === 'REJECTED' ? 'Reject' : 'Approve'} Expense
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
            onClick={handleConfirmStatusUpdate}
            color={selectedExpense?.action === 'REJECTED' ? 'error' : 'success'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}