import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import ManageUsers from '../components/Admin/ManageUsers';
import ManageProperties from '../components/Admin/ManageProperties';
import ManageAmenities from '../components/Admin/ManageAmenities';
import LoadingSpinner from '../components/Common/LoadingSpinner';

// ✅ TabPanel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminPanelPage = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);

  if (authLoading) return <LoadingSpinner />;
  if (!isAdmin)
    return (
      <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#b30000', fontWeight: 'bold' }}>
          Access Denied
        </Typography>
        <Typography variant="body1" mt={2}>
          You do not have administrative privileges to view this page.
        </Typography>
      </Container>
    );

  const handleChangeTab = (event, newValue) => setCurrentTab(newValue);

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
      {/* Header Section */}
      <Paper
        elevation={3}
        sx={{
          backgroundColor: '#b30000',
          color: 'white',
          textAlign: 'center',
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="h6">
          Welcome, {user?.username || 'Admin'} — Manage everything here
        </Typography>
      </Paper>

      {/* Tabs Section */}
      <Box
        sx={{
          width: '100%',
          mt: 4,
          borderRadius: 2,
          backgroundColor: 'white',
          boxShadow: '0px 3px 6px rgba(0,0,0,0.2)',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          aria-label="admin panel tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: '#b30000',
            color: 'white',
            '& .MuiTab-root': { color: 'white', fontWeight: 'bold' },
            '& .Mui-selected': { backgroundColor: 'white', color: '#b30000' },
          }}
        >
          <Tab label="Manage Users" />
          <Tab label="Manage Properties" />
          <Tab label="Manage Amenities" />
        </Tabs>

        {/* Tab Contents */}
        <TabPanel value={currentTab} index={0}>
          <ManageUsers />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <ManageProperties />
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <ManageAmenities />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default AdminPanelPage;
