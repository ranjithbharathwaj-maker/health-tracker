import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import PatientCard from '../components/PatientCard';
import {
  Box, Typography, TextField, Grid, CircularProgress, InputAdornment,
  Card, CardContent, Chip,
} from '@mui/material';
import { Search, People, NotificationsActive, Assessment } from '@mui/icons-material';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          API.get('/api/doctors/patients'),
          API.get('/api/doctors/alerts'),
        ]);
        setPatients(pRes.data);
        setAlerts(aRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await API.get(`/api/doctors/patients?search=${search}`);
      setPatients(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { if (search !== '') handleSearch(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: <People />, color: '#40C4FF' },
    { label: 'Critical Alerts', value: alerts.filter(a => a.risk_assessment.level === 'high').length, icon: <NotificationsActive />, color: '#FF5252' },
    { label: 'Moderate Risk', value: alerts.filter(a => a.risk_assessment.level === 'moderate').length, icon: <Assessment />, color: '#FFB74D' },
  ];

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
        <Typography variant="h4" fontWeight={700} mb={0.5}>Doctor Dashboard</Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Manage and monitor your patients
        </Typography>

        {/* Stats */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {stats.map((s) => (
            <Grid item xs={12} sm={4} key={s.label}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                  <Box sx={{
                    p: 1.5, borderRadius: 2,
                    backgroundColor: `${s.color}15`,
                    color: s.color,
                  }}>
                    {s.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search */}
        <TextField
          fullWidth placeholder="Search patients by name or email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9AA0A6' }} /></InputAdornment>,
          }}
        />

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <NotificationsActive sx={{ color: '#FF5252' }} />
              <Typography variant="h6" fontWeight={600}>Patients Requiring Attention</Typography>
              <Chip label={alerts.length} size="small" sx={{
                backgroundColor: 'rgba(255,82,82,0.15)', color: '#FF5252', fontWeight: 700,
              }} />
            </Box>
            <Grid container spacing={2}>
              {alerts.slice(0, 4).map((a) => (
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
          </Box>
        )}

        {/* All Patients */}
        <Typography variant="h6" fontWeight={600} mb={2}>All Patients</Typography>
        <Grid container spacing={2}>
          {patients.map((p) => (
            <Grid item xs={12} md={6} lg={4} key={p.id}>
              <PatientCard
                patient={p}
                onClick={() => navigate(`/doctor/patients/${p.id}`)}
              />
            </Grid>
          ))}
        </Grid>

        {patients.length === 0 && (
          <Card><CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No patients found</Typography>
          </CardContent></Card>
        )}
      </Box>
    </Box>
  );
}
