import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import PatientCard from '../components/PatientCard';
import {
  Box, Typography, Grid, CircularProgress, TextField, InputAdornment,
} from '@mui/material';
import { People, Search } from '@mui/icons-material';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPatients = async (q = '') => {
    try {
      const res = await API.get(`/api/doctors/patients${q ? `?search=${q}` : ''}`);
      setPatients(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <People sx={{ color: '#00BFA6', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>All Patients</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={3}>
          {patients.length} patient(s) registered
        </Typography>

        <TextField
          fullWidth placeholder="Search by name or email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9AA0A6' }} /></InputAdornment>,
          }}
        />

        <Grid container spacing={2}>
          {patients.map((p) => (
            <Grid item xs={12} md={6} lg={4} key={p.id}>
              <PatientCard patient={p} onClick={() => navigate(`/doctor/patients/${p.id}`)} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
