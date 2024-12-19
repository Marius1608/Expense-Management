import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'EMPLOYEE',
    departmentId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      console.log('Fetched users:', data); // Debug log
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/departments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      console.log('Fetched departments:', data); // Debug log
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setUserForm({
        username: user.username,
        password: '', // Password field empty for editing
        email: user.email,
        role: user.role,
        departmentId: user.department?.id || ''
      });
      setSelectedUser(user);
    } else {
      setUserForm({
        username: '',
        password: '',
        email: '',
        role: 'EMPLOYEE',
        departmentId: ''
      });
      setSelectedUser(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!userForm.password && !selectedUser) {
        setError('Password is required for new users');
        return;
      }

      const url = selectedUser 
        ? `http://localhost:8080/api/admin/users/${selectedUser.id}`
        : 'http://localhost:8080/api/admin/users';
      
      const userData = {
        ...userForm,
        department: { id: userForm.departmentId }, // Properly format department
        ...(userForm.password && { password: userForm.password })
      };

      console.log('Submitting user data:', userData); // Debug log

      const response = await fetch(url, {
        method: selectedUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.message);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        fetchUsers();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">User Management</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.department?.name}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add User'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={userForm.username}
              onChange={(e) => setUserForm({
                ...userForm,
                username: e.target.value
              })}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={userForm.password}
              onChange={(e) => setUserForm({
                ...userForm,
                password: e.target.value
              })}
              required={!selectedUser}
              helperText={selectedUser ? "Leave blank to keep current password" : ""}
            />
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={userForm.email}
              onChange={(e) => setUserForm({
                ...userForm,
                email: e.target.value
              })}
            />
            <TextField
              select
              fullWidth
              label="Role"
              margin="normal"
              value={userForm.role}
              onChange={(e) => setUserForm({
                ...userForm,
                role: e.target.value
              })}
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
              <MenuItem value="DEPARTMENT_HEAD">Department Head</MenuItem>
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Department"
              margin="normal"
              value={userForm.departmentId}
              onChange={(e) => setUserForm({
                ...userForm,
                departmentId: e.target.value
              })}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}