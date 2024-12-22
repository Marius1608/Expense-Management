import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  CalendarMonth,
  Assessment,
  Person,
  Schedule,
  CreditCard,
  Article
} from '@mui/icons-material';
import { useState } from 'react';

const DataField = ({ icon: Icon, label, value }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    gap: 2,
    p: 2,
    bgcolor: 'grey.50',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider'
  }}>
    <Icon sx={{ color: 'primary.main', fontSize: 28 }} />
    <Box>
      <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    try {
      setError('');
      setLoading(true);
      
      if (!dateRange.startDate || !dateRange.endDate) {
        setError('Please select both start and end dates');
        return;
      }

      const response = await fetch('http://localhost:8080/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dateRange)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReportData(data);
    } catch (error) {
      console.error('Report generation error:', error);
      setError(error.message || 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Reports
      </Typography>

      <Card 
        elevation={0}
        sx={{ 
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          position: 'relative'
        }}
      >
        {loading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12
            }}
          />
        )}
        
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Assessment sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Generate Report
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  startDate: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  endDate: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={generateReport}
                disabled={loading}
                sx={{ 
                  height: '56px',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mt: 3, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {reportData && (
        <Card 
          elevation={0}
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Article sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Report Summary
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DataField 
                  icon={CreditCard}
                  label="Total Amount"
                  value={`$${reportData.totalAmount}`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DataField 
                  icon={Person}
                  label="Generated By"
                  value={reportData.generatedBy}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DataField 
                  icon={CalendarMonth}
                  label="Period"
                  value={`${new Date(reportData.startDate).toLocaleDateString()} - ${new Date(reportData.endDate).toLocaleDateString()}`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DataField 
                  icon={Schedule}
                  label="Generated At"
                  value={new Date(reportData.createdAt).toLocaleString()}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2,
                  bgcolor: reportData.reportStatus === 'COMPLETED' ? 'success.soft' : 'warning.soft',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: reportData.reportStatus === 'COMPLETED' ? 'success.main' : 'warning.main'
                    }}
                  />
                  <Typography sx={{ fontWeight: 500 }}>
                    Status: {reportData.reportStatus}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}