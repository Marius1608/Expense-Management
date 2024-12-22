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
  Alert,
  IconButton,
  LinearProgress,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle,
  Cancel as RejectIcon,
  AttachMoney,
  CalendarToday,
  Category
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comment, setComment] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': { fontSize: '0.95rem' }
          }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Expenses
        </Typography>
        {user?.role === 'EMPLOYEE' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/expenses/new')}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)'
              }
            }}
          >
            Add Expense
          </Button>
        )}
      </Box>
      
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <LinearProgress sx={{ height: 2 }} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: 'grey.50',
                    '& th': {
                      fontWeight: 600,
                      color: 'grey.700',
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow 
                    key={expense.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      {expense.description}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ color: 'success.main', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 500 }}>
                          {expense.amount}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ color: 'primary.main', fontSize: 18 }} />
                        {new Date(expense.date).toLocaleDateString()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Category sx={{ color: 'secondary.main', fontSize: 18 }} />
                        {expense.category?.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.status}
                        color={getStatusColor(expense.status)}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          borderRadius: 1.5,
                          px: 1
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {canApproveReject(expense) && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleStatusUpdate(expense, 'APPROVED')}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': { boxShadow: 1 }
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<RejectIcon />}
                              onClick={() => handleStatusUpdate(expense, 'REJECTED')}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': { boxShadow: 1 }
                              }}
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
        )}
      </Card>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          fontWeight: 600
        }}>
          {selectedExpense?.action === 'REJECTED' ? 'Reject' : 'Approve'} Expense
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStatusUpdate}
            color={selectedExpense?.action === 'REJECTED' ? 'error' : 'success'}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}