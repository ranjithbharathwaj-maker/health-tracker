import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Avatar, Divider, IconButton,
} from '@mui/material';
import {
  Dashboard, PersonAdd, MonitorHeart, Description, Logout,
  People, NotificationsActive, MedicalServices, LocalHospital,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const patientMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/patient' },
  { text: 'Add Health Record', icon: <PersonAdd />, path: '/patient/add-record' },
  { text: 'My Health History', icon: <MonitorHeart />, path: '/patient/records' },
  { text: 'Upload Report', icon: <Description />, path: '/patient/upload' },
  { text: 'My Prescriptions', icon: <MedicalServices />, path: '/patient/prescriptions' },
];

const doctorMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/doctor' },
  { text: 'All Patients', icon: <People />, path: '/doctor/patients' },
  { text: 'Alerts', icon: <NotificationsActive />, path: '/doctor/alerts' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = user?.role === 'doctor' ? doctorMenuItems : patientMenuItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0d1130 0%, #131735 100%)',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center', mb: 1,
        }}>
          <LocalHospital sx={{ color: '#00BFA6', fontSize: 32 }} />
          <Typography variant="h6" sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00BFA6, #7C4DFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            HealthTracker
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{
          background: 'linear-gradient(135deg, #00BFA6, #7C4DFF)',
          width: 40, height: 40, fontSize: 16, fontWeight: 700,
        }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
          <Typography variant="caption" sx={{ color: '#9AA0A6', textTransform: 'capitalize' }}>
            {user?.role}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                py: 1.2,
                backgroundColor: location.pathname === item.path
                  ? 'rgba(0, 191, 166, 0.12)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(0, 191, 166, 0.08)' },
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path ? '#00BFA6' : '#9AA0A6',
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: 14, fontWeight: location.pathname === item.path ? 600 : 400,
                  color: location.pathname === item.path ? '#00BFA6' : '#E8EAED',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <List sx={{ px: 1.5, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => { logout(); navigate('/login'); }} sx={{ borderRadius: 2, py: 1.2 }}>
            <ListItemIcon sx={{ color: '#FF5252', minWidth: 40 }}><Logout /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: '#FF5252' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
