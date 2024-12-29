import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const statusColors = {
  'Beklemede': 'warning',
  'Devam Ediyor': 'info',
  'Tamamlandı': 'success',
  'İptal Edildi': 'error'
};

const priorityColors = {
  'Düşük': 'success',
  'Orta': 'warning',
  'Yüksek': 'error'
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Beklemede',
    priority: 'Orta',
    startDate: '',
    endDate: '',
    departmentId: '',
    divisionId: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Projeler yüklenirken hata:', error);
      setError('Projeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project = null) => {
    if (project) {
      setSelectedProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate?.split('T')[0] || '',
        endDate: project.endDate?.split('T')[0] || '',
        departmentId: project.departmentId || '',
        divisionId: project.divisionId || ''
      });
    } else {
      setSelectedProject(null);
      setFormData({
        title: '',
        description: '',
        status: 'Beklemede',
        priority: 'Orta',
        startDate: '',
        endDate: '',
        departmentId: '',
        divisionId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProject(null);
    setFormData({
      title: '',
      description: '',
      status: 'Beklemede',
      priority: 'Orta',
      startDate: '',
      endDate: '',
      departmentId: '',
      divisionId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProject) {
        await axios.put(`/api/projects/${selectedProject.id}`, formData);
      } else {
        await axios.post('/api/projects', formData);
      }
      fetchProjects();
      handleCloseDialog();
    } catch (error) {
      console.error('Proje kaydedilirken hata:', error);
      setError('Proje kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        fetchProjects();
      } catch (error) {
        console.error('Proje silinirken hata:', error);
        setError('Proje silinirken bir hata oluştu');
      }
    }
  };

  const calculateProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'Tamamlandı').length;
    return (completedTasks / project.tasks.length) * 100;
  };

  const calculateElapsedDays = (startDate) => {
    return differenceInDays(new Date(), new Date(startDate));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Projeler
        </Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Proje
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Proje Adı</TableCell>
              <TableCell>Daire Başkanlığı</TableCell>
              <TableCell>Şube Müdürlüğü</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Öncelik</TableCell>
              <TableCell>Başlangıç</TableCell>
              <TableCell>Bitiş</TableCell>
              <TableCell>Geçen Süre</TableCell>
              <TableCell>İlerleme</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? projects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : projects
            ).map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Typography variant="subtitle2">{project.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                    {project.description}
                  </Typography>
                </TableCell>
                <TableCell>{project.department?.name || '-'}</TableCell>
                <TableCell>{project.division?.name || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    size="small"
                    color={statusColors[project.status]}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<FlagIcon />}
                    label={project.priority}
                    size="small"
                    color={priorityColors[project.priority]}
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(project.startDate), 'd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell>
                  {format(new Date(project.endDate), 'd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell>
                  {calculateElapsedDays(project.startDate)} gün
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(project)}
                      sx={{ width: 100, mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(calculateProgress(project))}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(project)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(project.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={projects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedProject ? 'Projeyi Düzenle' : 'Yeni Proje'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Proje Adı"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Durum"
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  {Object.keys(statusColors).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Öncelik"
                  name="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  {Object.keys(priorityColors).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Başlangıç Tarihi"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bitiş Tarihi"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Daire Başkanlığı"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {/* Daire başkanlıkları buraya gelecek */}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Şube Müdürlüğü"
                  name="divisionId"
                  value={formData.divisionId}
                  onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">
                    <em>Seçiniz</em>
                  </MenuItem>
                  {/* Şube müdürlükleri buraya gelecek */}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedProject ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
