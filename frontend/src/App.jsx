import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import HealthRecordForm from './pages/HealthRecordForm';
import HealthRecords from './pages/HealthRecords';
import UploadReport from './pages/UploadReport';
import Prescriptions from './pages/Prescriptions';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatients from './pages/DoctorPatients';
import PatientDetail from './pages/PatientDetail';
import DoctorAlerts from './pages/DoctorAlerts';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} /> : <Register />} />

      {/* Patient Routes */}
      <Route path="/patient" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/add-record" element={<ProtectedRoute role="patient"><HealthRecordForm /></ProtectedRoute>} />
      <Route path="/patient/records" element={<ProtectedRoute role="patient"><HealthRecords /></ProtectedRoute>} />
      <Route path="/patient/upload" element={<ProtectedRoute role="patient"><UploadReport /></ProtectedRoute>} />
      <Route path="/patient/prescriptions" element={<ProtectedRoute role="patient"><Prescriptions /></ProtectedRoute>} />

      {/* Doctor Routes */}
      <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><DoctorPatients /></ProtectedRoute>} />
      <Route path="/doctor/patients/:id" element={<ProtectedRoute role="doctor"><PatientDetail /></ProtectedRoute>} />
      <Route path="/doctor/alerts" element={<ProtectedRoute role="doctor"><DoctorAlerts /></ProtectedRoute>} />

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
