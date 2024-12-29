import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountTree as TreeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Axios interceptor'ları ekle
axios.interceptors.request.use(request => {
  console.log('Request:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

const Organization = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    parentId: '',
    level: 0,
    order: 0,
  });

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/organizations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setOrganizations(response.data.data || []);
        setError(null);
      } else {
        setError(response.data.message || 'Organizasyon yapısı yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Organizasyon yapısı yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleOpenDialog = (org = null) => {
    if (org) {
      setSelectedOrg(org);
      setFormData({
        title: org.title,
        description: org.description || '',
        parentId: org.parentId || '',
        level: org.level || 0,
        order: org.order || 0,
      });
    } else {
      setSelectedOrg(null);
      setFormData({
        title: '',
        description: '',
        parentId: '',
        level: 0,
        order: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrg(null);
    setFormData({
      title: '',
      description: '',
      parentId: '',
      level: 0,
      order: 0,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      let response;
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };

      // Form verilerini kontrol et
      if (!formData.title) {
        setError('Birim adı zorunludur');
        return;
      }

      if (formData.level < 0) {
        setError('Seviye 0 veya daha büyük olmalıdır');
        return;
      }

      if (formData.order < 0) {
        setError('Sıra 0 veya daha büyük olmalıdır');
        return;
      }

      // parentId boş string ise null yap
      const dataToSend = {
        ...formData,
        parentId: formData.parentId || null
      };

      if (selectedOrg) {
        response = await axios.put(
          `http://localhost:5000/organizations/${selectedOrg.id}`,
          dataToSend,
          config
        );
      } else {
        console.log('Gönderilen veri:', dataToSend);
        response = await axios.post('http://localhost:5000/organizations', dataToSend, config);
      }
      
      if (response.data.success) {
        await fetchOrganizations();
        handleCloseDialog();
        setError(null);
      } else {
        setError(response.data.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(
        error.response?.data?.message ||
        (selectedOrg
          ? 'Birim güncellenirken bir hata oluştu'
          : 'Birim oluşturulurken bir hata oluştu')
      );
    }
  };

  const handleDelete = async (orgId) => {
    if (window.confirm('Bu birimi silmek istediğinize emin misiniz?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/organizations/${orgId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          await fetchOrganizations();
          setError(null);
        } else {
          setError(response.data.message || 'Silme işlemi başarısız');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError(error.response?.data?.message || 'Birim silinirken bir hata oluştu');
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderOrganizationItem = (org) => {
    const hasChildren = org.children && org.children.length > 0;
    const isExpanded = expandedItems[org.id];

    return (
      <Box key={org.id}>
        <ListItem
          sx={{
            borderLeft: '2px solid #e0e0e0',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon>
            <TreeIcon />
          </ListItemIcon>
          <ListItemText
            primary={org.title}
            secondary={org.description}
          />
          {hasChildren && (
            <IconButton onClick={() => toggleExpand(org.id)}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
          {user?.role === 'admin' && (
            <>
              <Tooltip title="Düzenle">
                <IconButton onClick={() => handleOpenDialog(org)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Sil">
                <IconButton onClick={() => handleDelete(org.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded}>
            <List sx={{ pl: 4 }}>
              {org.children.map((child) => renderOrganizationItem(child))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Organizasyon Yapısı
          </Typography>
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Yeni Birim Ekle
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <List>
          {organizations.map((org) => renderOrganizationItem(org))}
        </List>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedOrg ? 'Birimi Düzenle' : 'Yeni Birim Ekle'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Birim Adı"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Açıklama"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                select
                label="Üst Birim"
                name="parentId"
                value={formData.parentId}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">Ana Birim</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                type="number"
                label="Seviye"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                type="number"
                label="Sıra"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedOrg ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Organization;
