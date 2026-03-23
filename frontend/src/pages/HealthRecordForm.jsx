import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import AlertBanner from '../components/AlertBanner';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Grid, Alert, Snackbar,
} from '@mui/material';
import { Add, Favorite, Bloodtype, MonitorWeight, Speed, Thermostat } from '@mui/icons-material';

export default function HealthRecordForm() {
  const [form, setForm] = useState({
    systolic_bp: '', diastolic_bp: '', sugar_level: '',
    weight: '', heart_rate: '', temperature: '', symptoms: '', notes: '',
  });
  const [alerts, setAlerts] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {};
      if (form.systolic_bp) payload.systolic_bp = parseInt(form.systolic_bp);
      if (form.diastolic_bp) payload.diastolic_bp = parseInt(form.diastolic_bp);
      if (form.sugar_level) payload.sugar_level = parseFloat(form.sugar_level);
      if (form.weight) payload.weight = parseFloat(form.weight);
      if (form.heart_rate) payload.heart_rate = parseInt(form.heart_rate);
      if (form.temperature) payload.temperature = parseFloat(form.temperature);
      if (form.symptoms) payload.symptoms = form.symptoms;
      if (form.notes) payload.notes = form.notes;

      const res = await API.post('/api/patients/health-records', payload);
      setAlerts(res.data.alerts || []);
      setSuccess(true);
      setForm({ systolic_bp: '', diastolic_bp: '', sugar_level: '', weight: '', heart_rate: '', temperature: '', symptoms: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'systolic_bp', label: 'Systolic BP', unit: 'mmHg', icon: <Favorite sx={{ color: '#FF5252' }} />, type: 'number' },
    { name: 'diastolic_bp', label: 'Diastolic BP', unit: 'mmHg', icon: <Favorite sx={{ color: '#FF7043' }} />, type: 'number' },
    { name: 'sugar_level', label: 'Sugar Level', unit: 'mg/dL', icon: <Bloodtype sx={{ color: '#FFB74D' }} />, type: 'number' },
    { name: 'weight', label: 'Weight', unit: 'kg', icon: <MonitorWeight sx={{ color: '#40C4FF' }} />, type: 'number' },
    { name: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: <Speed sx={{ color: '#69F0AE' }} />, type: 'number' },
    { name: 'temperature', label: 'Temperature', unit: '°F', icon: <Thermostat sx={{ color: '#CE93D8' }} />, type: 'number' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px`, p: 4, minHeight: '100vh', background: '#0a0e27' }}>
        <Typography variant="h4" fontWeight={700} mb={1}>Add Health Record</Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Enter your latest health measurements
        </Typography>

        {alerts.length > 0 && (
          <Box sx={{ mb: 3 }}><AlertBanner alerts={alerts} /></Box>
        )}

        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {fields.map((f) => (
                  <Grid item xs={12} sm={6} md={4} key={f.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {f.icon}
                      <Typography variant="body2" fontWeight={500}>{f.label} ({f.unit})</Typography>
                    </Box>
                    <TextField
                      fullWidth name={f.name} type={f.type} value={form[f.name]}
                      onChange={handleChange} placeholder={`Enter ${f.label.toLowerCase()}`}
                      size="small"
                    />
                  </Grid>
                ))}
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>Symptoms</Typography>
                  <TextField
                    fullWidth name="symptoms" value={form.symptoms} onChange={handleChange}
                    multiline rows={3} placeholder="Describe any symptoms..."
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>Notes</Typography>
                  <TextField
                    fullWidth name="notes" value={form.notes} onChange={handleChange}
                    multiline rows={3} placeholder="Additional notes..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit" variant="contained" size="large" disabled={loading}
                    startIcon={<Add />} sx={{ px: 5, py: 1.5 }}
                  >
                    {loading ? 'Saving...' : 'Save Health Record'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}
          message="Health record saved successfully!" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
      </Box>
    </Box>
  );
}
