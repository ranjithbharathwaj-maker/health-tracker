import { Card, CardContent, Box, Typography, Avatar, Chip, IconButton } from '@mui/material';
import { Person, ArrowForward, Male, Female } from '@mui/icons-material';
import { RiskBadge } from './AlertBanner';

export default function PatientCard({ patient, risk, alerts, onClick }) {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,191,166,0.2)' },
        transition: 'all 0.3s ease',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              background: 'linear-gradient(135deg, #00BFA6, #7C4DFF)',
              width: 48, height: 48, fontWeight: 700,
            }}>
              {patient.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{patient.name}</Typography>
              <Typography variant="body2" color="text.secondary">{patient.email}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                {patient.age && (
                  <Chip label={`${patient.age} yrs`} size="small" sx={{
                    fontSize: 11, height: 22, backgroundColor: 'rgba(255,255,255,0.06)',
                  }} />
                )}
                {patient.gender && (
                  <Chip
                    icon={patient.gender === 'male' ? <Male sx={{ fontSize: 14 }} /> : <Female sx={{ fontSize: 14 }} />}
                    label={patient.gender}
                    size="small"
                    sx={{ fontSize: 11, height: 22, backgroundColor: 'rgba(255,255,255,0.06)', textTransform: 'capitalize' }}
                  />
                )}
                {risk && <RiskBadge level={risk.level} score={risk.score} />}
              </Box>
            </Box>
          </Box>
          <IconButton sx={{ color: '#00BFA6' }}>
            <ArrowForward />
          </IconButton>
        </Box>
        {alerts && alerts.length > 0 && (
          <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {alerts.slice(0, 2).map((a, i) => (
              <Typography key={i} variant="caption" sx={{
                color: a.includes('CRITICAL') ? '#FF5252' : '#FFB74D',
                fontSize: 11,
              }}>
                {a.length > 60 ? a.substring(0, 60) + '...' : a}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
