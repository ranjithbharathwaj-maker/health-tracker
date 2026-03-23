import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import HealthChart from '../components/HealthChart';
import AlertBanner from '../components/AlertBanner';
import { RiskBadge } from '../components/AlertBanner';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress,
  TextField, Button, Avatar, Chip, Divider, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Person, Add, MedicalServices } from '@mui/icons-material';

export default function PatientDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteForm, setNoteForm] = useState({ prescription: '', diagnosis: '', notes: '', follow_up_date: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get(`/api/doctors/patients/${id}`);
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleNote = (e) => setNoteForm({ ...noteForm, [e.target.name]: e.target.value });

  const submitNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post(`/api/doctors/patients/${id}/notes`, noteForm);
      setNoteForm({ prescription: '', diagnosis: '', notes: '', follow_up_date: '' });
      setSuccess(true);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

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

  const { patient, health_records, doctor_notes, risk_assessment } = data || {};
  const latestAlerts = health_records?.[0]?.alerts || [];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px`, p: 4, minHeight: '100vh', background: '#0a0e27' }}>
        {/* Patient Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar sx={{
                background: 'linear-gradient(135deg, #00BFA6, #7C4DFF)',
                width: 64, height: 64, fontSize: 24, fontWeight: 700,
              }}>
                {patient?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700}>{patient?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{patient?.email}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {patient?.age && <Chip label={`${patient.age} years`} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />}
                  {patient?.gender && <Chip label={patient.gender} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.06)', textTransform: 'capitalize' }} />}
                  {patient?.phone && <Chip label={patient.phone} size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />}
                  {risk_assessment && <RiskBadge level={risk_assessment.level} score={risk_assessment.score} />}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Alerts */}
        {latestAlerts.length > 0 && <Box sx={{ mb: 3 }}><AlertBanner alerts={latestAlerts} /></Box>}

        {/* Risk & Recommendations */}
        {risk_assessment && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={1}>AI Health Assessment</Typography>
              <Typography variant="body2" mb={2}>{risk_assessment.message}</Typography>
              {risk_assessment.recommendations?.map((r, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 1, alignItems: 'flex-start' }}>
                  <Chip label={i + 1} size="small" sx={{ backgroundColor: 'rgba(0,191,166,0.15)', color: '#00BFA6', fontWeight: 700, minWidth: 28 }} />
                  <Typography variant="body2">{r}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Blood Pressure</Typography>
              <HealthChart records={health_records} metrics={['systolic_bp', 'diastolic_bp']} />
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Sugar & Weight</Typography>
              <HealthChart records={health_records} metrics={['sugar_level', 'weight']} />
            </CardContent></Card>
          </Grid>
        </Grid>

        {/* Health Records Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Health Records</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>BP</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Sugar</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Weight</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>HR</TableCell>
                    <TableCell sx={{ color: '#9AA0A6', fontWeight: 600 }}>Symptoms</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {health_records?.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{r.systolic_bp && r.diastolic_bp ? `${r.systolic_bp}/${r.diastolic_bp}` : '—'}</TableCell>
                      <TableCell>{r.sugar_level ?? '—'}</TableCell>
                      <TableCell>{r.weight ?? '—'}</TableCell>
                      <TableCell>{r.heart_rate ?? '—'}</TableCell>
                      <TableCell>{r.symptoms || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Add Note / Prescription */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              <MedicalServices sx={{ mr: 1, verticalAlign: 'middle', color: '#00BFA6' }} />
              Add Prescription / Notes
            </Typography>
            <form onSubmit={submitNote}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Diagnosis" name="diagnosis" value={noteForm.diagnosis} onChange={handleNote} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Follow-up Date" name="follow_up_date" type="date" value={noteForm.follow_up_date} onChange={handleNote} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Prescription" name="prescription" value={noteForm.prescription} onChange={handleNote} multiline rows={3} placeholder="Enter prescription details..." />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Doctor's Notes" name="notes" value={noteForm.notes} onChange={handleNote} multiline rows={2} placeholder="Additional observations..." />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" startIcon={<Add />} disabled={saving} sx={{ px: 4 }}>
                    {saving ? 'Saving...' : 'Add Prescription'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Previous Notes */}
        {doctor_notes?.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Previous Notes & Prescriptions</Typography>
              {doctor_notes.map((n) => (
                <Box key={n.id} sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#00BFA6' }}>{n.diagnosis || 'Note'}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(n.created_at).toLocaleDateString()}</Typography>
                  </Box>
                  {n.prescription && <Typography variant="body2" mb={0.5}><strong>Rx:</strong> {n.prescription}</Typography>}
                  {n.notes && <Typography variant="body2" color="text.secondary">{n.notes}</Typography>}
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}
          message="Prescription added successfully!" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
      </Box>
    </Box>
  );
}
