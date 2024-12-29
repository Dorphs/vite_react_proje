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
  TablePagination,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  Person as PersonIcon
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

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Beklemede',
    priority: 'Orta',
    dueDate: '',
    projectId: '',
    assignedToId: '',
    departmentId: '',
    divisionId: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/tasks');
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Görevler yüklenirken hata:', error);
      setError('Görevler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Projeler yüklenirken hata:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate?.split('T')[0] || '',
        projectId: task.projectId || '',
        assignedToId: task.assignedToId || '',
        departmentId: task.departmentId || '',
        divisionId: task.divisionId || ''
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'Beklemede',
        priority: 'Orta',
        dueDate: '',
        projectId: '',
        assignedToId: '',
        departmentId: '',
        divisionId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'Beklemede',
      priority: 'Orta',
      dueDate: '',
      projectId: '',
      assignedToId: '',
      departmentId: '',
      divisionId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTask) {
        await axios.put(`/api/tasks/${selectedTask.id}`, formData);
      } else {
        await axios.post('/api/tasks', formData);
      }
      fetchTasks();
      handleCloseDialog();
    } catch (error) {
      console.error('Görev kaydedilirken hata:', error);
      setError('Görev kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`/api/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Görev silinirken hata:', error);
        setError('Görev silinirken bir hata oluştu');
      }
    }
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

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Görevler
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Görev
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
              <TableCell>Görev</TableCell>
              <TableCell>Proje</TableCell>
              <TableCell>Daire Başkanlığı</TableCell>
              <TableCell>Şube Müdürlüğü</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Öncelik</TableCell>
              <TableCell>Atanan</TableCell>
              <TableCell>Başlangıç</TableCell>
              <TableCell>Bitiş</TableCell>
              <TableCell>Geçen Süre</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : tasks
            ).map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Typography variant="subtitle2">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                    {task.description}
                  </Typography>
                </TableCell>
                <TableCell>{task.project?.title || '-'}</TableCell>
                <TableCell>{task.department?.name || '-'}</TableCell>
                <TableCell>{task.division?.name || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    size="small"
                    color={statusColors[task.status]}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<FlagIcon />}
                    label={task.priority}
                    size="small"
                    color={priorityColors[task.priority]}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {task.assignedTo ? (
                      <Tooltip title={task.assignedTo.name}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.75rem',
                            mr: 1
                          }}
                        >
                          {task.assignedTo.name.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    ) : (
                      <PersonIcon color="disabled" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="body2">
                      {task.assignedTo?.name || '-'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {format(new Date(task.startDate), 'd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell>
                  {format(new Date(task.dueDate), 'd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell>
                  {calculateElapsedDays(task.startDate)} gün
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(task)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(task.id)}
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
          count={tasks.length}
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
          {selectedTask ? 'Görevi Düzenle' : 'Yeni Görev'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Görev Adı"
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
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Proje"
                  name="projectId"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">
                    <em>Proje Seçin</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Atanan Kişi"
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">
                    <em>Kişi Seçin</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTask ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
