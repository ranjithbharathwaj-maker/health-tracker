import { useState, useEffect } from 'react';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import HealthChart from '../components/HealthChart';
import AlertBanner from '../components/AlertBanner';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Paper,
} from '@mui/material';
import { MonitorHeart } from '@mui/icons-material';

export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/patients/health-records')
      .then((res) => setRecords(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress sx={{ color: '#00BFA6' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px`, p: 4, minHeight: '100vh', background: '#0a0e27' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <MonitorHeart sx={{ color: '#00BFA6', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>Health History</Typography>
        </Box>

        {/* Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>All Metrics Overview</Typography>
            <HealthChart records={records} metrics={['systolic_bp', 'sugar_level', 'weight', 'heart_rate']} />
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Records</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>BP (mmHg)</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Sugar (mg/dL)</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Weight (kg)</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>HR (bpm)</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Temp (°F)</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Alerts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{r.systolic_bp && r.diastolic_bp ? `${r.systolic_bp}/${r.diastolic_bp}` : '—'}</TableCell>
                      <TableCell>{r.sugar_level ?? '—'}</TableCell>
                      <TableCell>{r.weight ?? '—'}</TableCell>
                      <TableCell>{r.heart_rate ?? '—'}</TableCell>
                      <TableCell>{r.temperature ?? '—'}</TableCell>
                      <TableCell>
                        {r.alerts?.length > 0 ? (
                          <Chip
                            label={`${r.alerts.length} alert(s)`}
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(255,82,82,0.15)',
                              color: '#FF5252',
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          />
                        ) : (
                          <Chip label="Normal" size="small" sx={{
                            backgroundColor: 'rgba(105,240,174,0.15)',
                            color: '#69F0AE', fontSize: 11,
                          }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
