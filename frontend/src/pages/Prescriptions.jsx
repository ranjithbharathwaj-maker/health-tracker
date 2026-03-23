import { useState, useEffect } from 'react';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import {
  Box, Typography, Card, CardContent, CircularProgress, Chip, Divider,
} from '@mui/material';
import { MedicalServices, Person, CalendarMonth } from '@mui/icons-material';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/patients/prescriptions')
      .then((res) => setPrescriptions(res.data))
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
          <MedicalServices sx={{ color: '#00BFA6', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>My Prescriptions</Typography>
        </Box>

        {prescriptions.length === 0 ? (
          <Card><CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No prescriptions yet</Typography>
          </CardContent></Card>
        ) : (
          prescriptions.map((p) => (
            <Card key={p.id} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    {p.diagnosis && (
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#00BFA6' }}>
                        {p.diagnosis}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person sx={{ fontSize: 16, color: '#9AA0A6' }} />
                        <Typography variant="body2" color="text.secondary">Dr. {p.doctor_name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonth sx={{ fontSize: 16, color: '#9AA0A6' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(p.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {p.follow_up_date && (
                    <Chip label={`Follow-up: ${p.follow_up_date}`} size="small" sx={{
                      backgroundColor: 'rgba(124,77,255,0.15)', color: '#b47cff',
                      fontWeight: 600, fontSize: 11,
                    }} />
                  )}
                </Box>
                {p.prescription && (
                  <>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1.5 }} />
                    <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>Prescription</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{p.prescription}</Typography>
                  </>
                )}
                {p.notes && (
                  <>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1.5 }} />
                    <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>Notes</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{p.notes}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}
