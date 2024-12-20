import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';

// Core components
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Reports from './components/Reports';

// Role-specific components
import AdminDashboard from './components/AdminDashboard';
import AdminReports from './components/AdminReports';
import AccountantDashboard from './components/AccountantDashboard';
import AccountantReports from './components/AccountantReports';
import DepartmentHeadDashboard from './components/DepartmentHeadDashboard';
import DepartmentHeadReports from './components/DepartmentHeadReports';
import ExpenseRequest from './components/ExpenseRequest';

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
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Dashboard route */}
                <Route index element={<Dashboard />} />

                {/* Common routes for all authenticated users */}
                <Route path="expenses" element={<ExpenseList />} />
                <Route path="expenses/new" element={<ExpenseForm />} />
                <Route path="reports" element={<Reports />} />
                
                {/* Employee routes */}
                <Route
                  path="expenses/requests"
                  element={
                    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                      <ExpenseRequest />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
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
                
                <Route
                  path="accountant"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <AccountantDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="accountant/reports"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <AccountantReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="accountant/review"
                  element={
                    <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
                      <ExpenseList />
                    </ProtectedRoute>
                  }
                />
                 
                <Route
                  path="department"
                  element={
                    <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD']}>
                      <DepartmentHeadDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="department/reports"
                  element={
                    <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD']}>
                      <DepartmentHeadReports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="department/approve"
                  element={
                    <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD']}>
                      <ExpenseList />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;