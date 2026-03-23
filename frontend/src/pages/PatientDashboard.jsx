import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import HealthChart from '../components/HealthChart';
import AlertBanner from '../components/AlertBanner';
import { RiskBadge } from '../components/AlertBanner';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  Chip, Divider,
} from '@mui/material';
import {
  Favorite, Bloodtype, MonitorWeight, Thermostat,
  Speed, TrendingUp,
} from '@mui/icons-material';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, riskRes] = await Promise.all([
          API.get('/api/patients/health-records'),
          API.get('/api/patients/risk-assessment'),
        ]);
        setRecords(recRes.data);
        setRisk(riskRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latest = records[0] || {};
  const latestAlerts = latest.alerts || [];

  const statCards = [
    { label: 'Blood Pressure', value: latest.systolic_bp ? `${latest.systolic_bp}/${latest.diastolic_bp}` : '—', unit: 'mmHg', icon: <Favorite />, color: '#FF5252' },
    { label: 'Sugar Level', value: latest.sugar_level ?? '—', unit: 'mg/dL', icon: <Bloodtype />, color: '#FFB74D' },
    { label: 'Weight', value: latest.weight ?? '—', unit: 'kg', icon: <MonitorWeight />, color: '#40C4FF' },
    { label: 'Heart Rate', value: latest.heart_rate ?? '—', unit: 'bpm', icon: <Speed />, color: '#69F0AE' },
    { label: 'Temperature', value: latest.temperature ?? '—', unit: '°F', icon: <Thermostat />, color: '#CE93D8' },
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
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            Welcome back, <span style={{ color: '#00BFA6' }}>{user?.name}</span>
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Here's your health overview
          </Typography>
          {risk && (
            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <RiskBadge level={risk.level} score={risk.score} />
              <Typography variant="body2" color="text.secondary">{risk.message}</Typography>
            </Box>
          )}
        </Box>

        {/* Alerts */}
        {latestAlerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <AlertBanner alerts={latestAlerts} />
          </Box>
        )}

        {/* Stat Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statCards.map((stat) => (
            <Grid item xs={12} sm={6} md={2.4} key={stat.label}>
              <Card>
                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                  <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.unit}
                  </Typography>
                  <Typography variant="body2" fontWeight={500} mt={0.5}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle', color: '#FF5252' }} />
                  Blood Pressure Trend
                </Typography>
                <HealthChart records={records} metrics={['systolic_bp', 'diastolic_bp']} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle', color: '#FFB74D' }} />
                  Sugar Level Trend
                </Typography>
                <HealthChart records={records} metrics={['sugar_level']} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle', color: '#40C4FF' }} />
                  Weight Trend
                </Typography>
                <HealthChart records={records} metrics={['weight']} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle', color: '#69F0AE' }} />
                  Heart Rate Trend
                </Typography>
                <HealthChart records={records} metrics={['heart_rate']} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recommendations */}
        {risk && risk.recommendations && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>AI Health Recommendations</Typography>
              {risk.recommendations.map((rec, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                  <Chip label={i + 1} size="small" sx={{
                    backgroundColor: 'rgba(0,191,166,0.15)', color: '#00BFA6',
                    fontWeight: 700, minWidth: 28,
                  }} />
                  <Typography variant="body2">{rec}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
