import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, MenuItem, Grid, IconButton, InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, LocalHospital } from '@mui/icons-material';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'patient',
    specialization: '', phone: '', age: '', gender: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        specialization: form.role === 'doctor' ? form.specialization : null,
      };
      const user = await register(payload);
      navigate(user.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(0,191,166,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(124,77,255,0.08) 0%, transparent 50%), #0a0e27',
      py: 4,
    }}>
      <Card sx={{
        width: 520, p: 1,
        background: 'rgba(19, 23, 53, 0.6)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LocalHospital sx={{ fontSize: 48, color: '#00BFA6', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} sx={{
              background: 'linear-gradient(135deg, #00BFA6, #7C4DFF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Join HealthTracker today
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Password" name="password" value={form.password}
                  type={showPw ? 'text' : 'password'} onChange={handleChange} required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPw(!showPw)} edge="end" sx={{ color: '#9AA0A6' }}>
                          {showPw ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth select label="Role" name="role" value={form.role} onChange={handleChange}>
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth select label="Gender" name="gender" value={form.gender} onChange={handleChange}>
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Age" name="age" type="number" value={form.age} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              </Grid>
              {form.role === 'doctor' && (
                <Grid item xs={12}>
                  <TextField fullWidth label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} />
                </Grid>
              )}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, fontSize: 16 }}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: '#9AA0A6' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00BFA6', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
