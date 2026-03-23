import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Box, Typography } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = {
  systolic_bp: { border: '#FF5252', bg: 'rgba(255, 82, 82, 0.1)' },
  diastolic_bp: { border: '#FF7043', bg: 'rgba(255, 112, 67, 0.1)' },
  sugar_level: { border: '#FFB74D', bg: 'rgba(255, 183, 77, 0.1)' },
  weight: { border: '#40C4FF', bg: 'rgba(64, 196, 255, 0.1)' },
  heart_rate: { border: '#69F0AE', bg: 'rgba(105, 240, 174, 0.1)' },
  temperature: { border: '#CE93D8', bg: 'rgba(206, 147, 216, 0.1)' },
};

const LABELS = {
  systolic_bp: 'Systolic BP (mmHg)',
  diastolic_bp: 'Diastolic BP (mmHg)',
  sugar_level: 'Sugar Level (mg/dL)',
  weight: 'Weight (kg)',
  heart_rate: 'Heart Rate (bpm)',
  temperature: 'Temperature (°F)',
};

export default function HealthChart({ records, metrics = ['systolic_bp', 'sugar_level', 'weight'] }) {
  if (!records || records.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No health data to display</Typography>
      </Box>
    );
  }

  const sorted = [...records].reverse();
  const labels = sorted.map((r) => {
    const d = new Date(r.created_at);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const datasets = metrics
    .filter((m) => sorted.some((r) => r[m] != null))
    .map((metric) => ({
      label: LABELS[metric] || metric,
      data: sorted.map((r) => r[metric] ?? null),
      borderColor: CHART_COLORS[metric]?.border || '#00BFA6',
      backgroundColor: CHART_COLORS[metric]?.bg || 'rgba(0,191,166,0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: CHART_COLORS[metric]?.border || '#00BFA6',
      spanGaps: true,
    }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#E8EAED', usePointStyle: true, padding: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(19, 23, 53, 0.95)',
        titleColor: '#00BFA6',
        bodyColor: '#E8EAED',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: '#9AA0A6' },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: { color: '#9AA0A6' },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
  };

  return (
    <Box sx={{ height: 350, position: 'relative' }}>
      <Line data={{ labels, datasets }} options={options} />
    </Box>
  );
}
