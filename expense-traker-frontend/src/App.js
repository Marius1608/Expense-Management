import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';

import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Reports from './components/Reports';
import AdminDashboard from './components/AdminDashboard';
import AdminReports from './components/AdminReports';
import ExpenseRequest from './components/ExpenseRequest';
import AccountantDashboard from './components/AccountantDashboard';
import DepartmentHeadDashboard from './components/DepartmentHeadDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, user } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ display: 'flex' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Common Routes */}
                <Route index element={<Dashboard />} />
                
                {/* Employee Routes */}
                <Route
                  path="expense-requests"
                  element={
                    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                      <ExpenseRequest />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Accountant Routes */}
                <Route
                  path="accountant"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <AccountantDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="expenses/review"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <ExpenseList />
                    </ProtectedRoute>
                  }
                />
                
                {/* Department Head Routes */}
                <Route
                  path="department"
                  element={
                    <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD']}>
                      <DepartmentHeadDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="expenses/approve"
                  element={
                    <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD']}>
                      <ExpenseList />
                    </ProtectedRoute>
                  }
                />
                
                {/* Routes accessible by all authenticated users */}
                <Route path="expenses" element={<ExpenseList />} />
                <Route path="expenses/new" element={<ExpenseForm />} />
                <Route path="reports" element={<Reports />} />
              </Route>
            </Routes>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;