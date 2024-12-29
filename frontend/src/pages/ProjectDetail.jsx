import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
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
  Tabs,
  Tab,
  Divider,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    assignedTo: '',
  });

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/projects/${id}`),
        axios.get(`http://localhost:5000/api/projects/${id}/tasks`),
        axios.get(`http://localhost:5000/api/projects/${id}/members`),
      ]);

      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
      setMembers(membersRes.data.data);
      setError(null);
    } catch (error) {
      setError('Proje bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenTaskDialog = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setTaskFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo || '',
      });
    } else {
      setSelectedTask(null);
      setTaskFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedTo: '',
      });
    }
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setSelectedTask(null);
    setTaskFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      assignedTo: '',
    });
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTaskSubmit = async () => {
    try {
      if (selectedTask) {
        await axios.put(
          `http://localhost:5000/api/tasks/${selectedTask.id}`,
          taskFormData
        );
      } else {
        await axios.post(`http://localhost:5000/api/projects/${id}/tasks`, taskFormData);
      }
      fetchProjectData();
      handleCloseTaskDialog();
    } catch (error) {
      setError(
        selectedTask
          ? 'Görev güncellenirken bir hata oluştu'
          : 'Görev oluşturulurken bir hata oluştu'
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
        fetchProjectData();
      } catch (error) {
        setError('Görev silinirken bir hata oluştu');
      }
    }
  };

  const handleOpenMemberDialog = () => {
    setOpenMemberDialog(true);
  };

  const handleCloseMemberDialog = () => {
    setOpenMemberDialog(false);
  };

  const handleAddMember = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/projects/${id}/members`, {
        userId,
      });
      fetchProjectData();
      handleCloseMemberDialog();
    } catch (error) {
      setError('Üye eklenirken bir hata oluştu');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Bu üyeyi projeden çıkarmak istediğinize emin misiniz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}/members/${userId}`);
        fetchProjectData();
      } catch (error) {
        setError('Üye çıkarılırken bir hata oluştu');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'info',
      IN_PROGRESS: 'warning',
      DONE: 'success',
      HIGH: 'error',
      MEDIUM: 'warning',
      LOW: 'success',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Alert severity="error">
        Proje bulunamadı
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {project.title}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {project.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
          <Chip
            label={project.status}
            color={getStatusColor(project.status)}
          />
          <Typography variant="body2" color="text.secondary">
            Başlangıç: {new Date(project.startDate).toLocaleDateString()}
          </Typography>
          {project.endDate && (
            <Typography variant="body2" color="text.secondary">
              Bitiş: {new Date(project.endDate).toLocaleDateString()}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarGroup max={4}>
            {members.map((member) => (
              <Tooltip key={member.id} title={member.name}>
                <Avatar>{member.name[0]}</Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
          {project.ownerId === user?.id && (
            <Button
              startIcon={<PersonIcon />}
              onClick={handleOpenMemberDialog}
              size="small"
            >
              Üye Ekle
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Görevler" />
          <Tab label="Ekip" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6">Görevler</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTaskDialog()}
            >
              Yeni Görev
            </Button>
          </Box>

          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Paper sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">{task.title}</Typography>
                    <Box>
                      <Tooltip title="Düzenle">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenTaskDialog(task)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography color="text.secondary" paragraph>
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                    <Chip
                      label={task.priority}
                      color={getStatusColor(task.priority)}
                      size="small"
                    />
                  </Box>
                  {task.assignee && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                        {task.assignee.name[0]}
                      </Avatar>
                      <Typography variant="body2">
                        {task.assignee.name}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {members.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>{member.name[0]}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{member.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.email}
                    </Typography>
                  </Box>
                  {project.ownerId === user?.id && member.id !== project.ownerId && (
                    <Tooltip title="Projeden Çıkar">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                {member.id === project.ownerId && (
                  <Chip label="Proje Sahibi" size="small" color="primary" />
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openTaskDialog}
        onClose={handleCloseTaskDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTask ? 'Görevi Düzenle' : 'Yeni Görev'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Görev Adı"
            name="title"
            value={taskFormData.title}
            onChange={handleTaskInputChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Açıklama"
            name="description"
            multiline
            rows={4}
            value={taskFormData.description}
            onChange={handleTaskInputChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            select
            label="Durum"
            name="status"
            value={taskFormData.status}
            onChange={handleTaskInputChange}
          >
            <MenuItem value="TODO">Yapılacak</MenuItem>
            <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
            <MenuItem value="DONE">Tamamlandı</MenuItem>
          </TextField>
          <TextField
            margin="normal"
            required
            fullWidth
            select
            label="Öncelik"
            name="priority"
            value={taskFormData.priority}
            onChange={handleTaskInputChange}
          >
            <MenuItem value="LOW">Düşük</MenuItem>
            <MenuItem value="MEDIUM">Orta</MenuItem>
            <MenuItem value="HIGH">Yüksek</MenuItem>
          </TextField>
          <TextField
            margin="normal"
            fullWidth
            select
            label="Atanan Kişi"
            name="assignedTo"
            value={taskFormData.assignedTo}
            onChange={handleTaskInputChange}
          >
            <MenuItem value="">Atanmadı</MenuItem>
            {members.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>İptal</Button>
          <Button onClick={handleTaskSubmit} variant="contained">
            {selectedTask ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMemberDialog}
        onClose={handleCloseMemberDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Üye Ekle</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Projeye eklemek istediğiniz üyeyi seçin
          </Typography>
          {/* Burada üye arama ve seçme işlemleri yapılacak */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMemberDialog}>İptal</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;
