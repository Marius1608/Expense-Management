import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'EMPLOYEE'
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      login(data.token, data);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              autoFocus
              value={userData.username}
              onChange={(e) => setUserData({
                ...userData,
                username: e.target.value
              })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={userData.password}
              onChange={(e) => setUserData({
                ...userData,
                password: e.target.value
              })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({
                ...userData,
                email: e.target.value
              })}
            />
            <TextField
              select
              margin="normal"
              required
              fullWidth
              label="Role"
              value={userData.role}
              onChange={(e) => setUserData({
                ...userData,
                role: e.target.value
              })}
            >
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
              <MenuItem value="DEPARTMENT_HEAD">Department Head</MenuItem>
            </TextField>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}