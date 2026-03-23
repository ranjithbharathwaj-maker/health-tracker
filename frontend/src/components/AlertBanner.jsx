import { Alert, Box, Typography, Chip } from '@mui/material';
import { Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  const getSeverity = (alert) => {
    if (alert.includes('CRITICAL')) return 'error';
    if (alert.includes('HIGH') || alert.includes('ELEVATED')) return 'warning';
    if (alert.includes('LOW')) return 'info';
    return 'info';
  };

  const getIcon = (severity) => {
    if (severity === 'error') return <ErrorIcon />;
    if (severity === 'warning') return <Warning />;
    return <CheckCircle />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {alerts.map((alert, index) => {
        const severity = getSeverity(alert);
        return (
          <Alert
            key={index}
            severity={severity}
            icon={getIcon(severity)}
            sx={{
              borderRadius: 2,
              backgroundColor: severity === 'error'
                ? 'rgba(255, 82, 82, 0.08)'
                : severity === 'warning'
                ? 'rgba(255, 183, 77, 0.08)'
                : 'rgba(64, 196, 255, 0.08)',
              border: `1px solid ${
                severity === 'error' ? 'rgba(255,82,82,0.3)'
                : severity === 'warning' ? 'rgba(255,183,77,0.3)'
                : 'rgba(64,196,255,0.3)'
              }`,
              '& .MuiAlert-icon': {
                color: severity === 'error' ? '#FF5252'
                  : severity === 'warning' ? '#FFB74D' : '#40C4FF',
              },
            }}
          >
            <Typography variant="body2" sx={{ color: '#E8EAED' }}>
              {alert}
            </Typography>
          </Alert>
        );
      })}
    </Box>
  );
}

export function RiskBadge({ level, score }) {
  const colors = {
    high: { bg: 'rgba(255,82,82,0.15)', color: '#FF5252', border: 'rgba(255,82,82,0.3)' },
    moderate: { bg: 'rgba(255,183,77,0.15)', color: '#FFB74D', border: 'rgba(255,183,77,0.3)' },
    low: { bg: 'rgba(105,240,174,0.15)', color: '#69F0AE', border: 'rgba(105,240,174,0.3)' },
    healthy: { bg: 'rgba(105,240,174,0.15)', color: '#69F0AE', border: 'rgba(105,240,174,0.3)' },
    unknown: { bg: 'rgba(154,160,166,0.15)', color: '#9AA0A6', border: 'rgba(154,160,166,0.3)' },
  };

  const c = colors[level] || colors.unknown;

  return (
    <Chip
      label={`Risk: ${level?.toUpperCase()} (${score}%)`}
      sx={{
        backgroundColor: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontWeight: 600,
        fontSize: 12,
      }}
    />
  );
}
