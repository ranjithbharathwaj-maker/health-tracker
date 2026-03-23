import { useState } from 'react';
import API from '../api/axios';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import {
  Box, Typography, Card, CardContent, Button, Alert, Snackbar,
  LinearProgress,
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await API.post('/api/patients/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px`, p: 4, minHeight: '100vh', background: '#0a0e27' }}>
        <Typography variant="h4" fontWeight={700} mb={1}>Upload Medical Report</Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Upload PDF or image files of your medical reports
        </Typography>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Box
              sx={{
                border: '2px dashed rgba(0,191,166,0.3)',
                borderRadius: 3, p: 6, textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#00BFA6',
                  backgroundColor: 'rgba(0,191,166,0.04)',
                },
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input" type="file" hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <CloudUpload sx={{ fontSize: 56, color: '#00BFA6', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} mb={1}>
                {file ? file.name : 'Click to upload or drag & drop'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                PDF, JPG, or PNG • Max 10MB
              </Typography>
            </Box>

            {file && (
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Description sx={{ color: '#00BFA6' }} />
                <Typography variant="body2" sx={{ flex: 1 }}>{file.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Button
                  variant="contained" onClick={handleUpload} disabled={uploading}
                  startIcon={<CloudUpload />}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </Box>
            )}

            {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 2, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #00BFA6, #7C4DFF)' } }} />}
          </CardContent>
        </Card>

        <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)}
          message="Report uploaded successfully!" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
      </Box>
    </Box>
  );
}
