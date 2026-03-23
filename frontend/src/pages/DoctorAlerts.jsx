import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import PatientCard from '../components/PatientCard';
import {
  Box, Typography, Grid, CircularProgress,
} from '@mui/material';
import { NotificationsActive } from '@mui/icons-material';

export default function DoctorAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/api/doctors/alerts')
      .then((res) => setAlerts(res.data))
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
          <NotificationsActive sx={{ color: '#FF5252', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>Patient Alerts</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Patients with abnormal health values, sorted by risk severity
        </Typography>

        {alerts.length === 0 ? (
          <Typography color="text.secondary">No alerts at this time. All patients are within normal ranges.</Typography>
        ) : (
          <Grid container spacing={2}>
            {alerts.map((a) => (
              <Grid item xs={12} md={6} key={a.patient.id}>
                <PatientCard
                  patient={a.patient}
                  risk={a.risk_assessment}
                  alerts={a.alerts}
                  onClick={() => navigate(`/doctor/patients/${a.patient.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
