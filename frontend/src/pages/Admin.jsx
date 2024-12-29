import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Paper,
} from '@mui/material';
import UsersManagement from '../components/admin/UsersManagement';
import DepartmentsManagement from '../components/admin/DepartmentsManagement';
import DivisionsManagement from '../components/admin/DivisionsManagement';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

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

export default function Admin() {
  const [value, setValue] = useState(0);
  const { user } = useAuth();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Sadece admin rolüne sahip kullanıcılar bu sayfaya erişebilir
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Yönetim Paneli
      </Typography>

      <Paper sx={{ width: '100%', mt: 3 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Kullanıcı Yönetimi" />
          <Tab label="Daire Başkanlıkları" />
          <Tab label="Şube Müdürlükleri" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <UsersManagement />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <DepartmentsManagement />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <DivisionsManagement />
        </TabPanel>
      </Paper>
    </Box>
  );
}
