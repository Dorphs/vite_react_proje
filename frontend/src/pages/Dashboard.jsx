import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment as ProjectIcon,
  Task as TaskIcon,
  Group as TeamIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: [],
    recentTasks: [],
    loading: true,
    error: null,
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          axios.get('/api/projects'),
          axios.get('/api/tasks'),
        ]);

        setStats({
          projects: projectsRes.data.data?.slice(0, 3) || [], // Son 3 proje
          recentTasks: tasksRes.data.data?.slice(0, 5) || [], // Son 5 görev
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Dashboard veri yükleme hatası:', error);
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: 'Veriler yüklenirken bir hata oluştu',
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Beklemede': 'warning',
      'Devam Ediyor': 'info',
      'Tamamlandı': 'success',
      'İptal Edildi': 'error'
    };
    return colors[status] || 'default';
  };

  if (stats.loading) {
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

  if (stats.error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {stats.error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Hoş Geldiniz, {user?.name || 'Kullanıcı'}
      </Typography>

      {/* Özet Kartları */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <ProjectIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6">Projeler</Typography>
              <Typography variant="h4">{stats.projects.length}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'secondary.main',
              color: 'white',
            }}
          >
            <TaskIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6">Görevler</Typography>
              <Typography variant="h4">{stats.recentTasks.length}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'success.main',
              color: 'white',
            }}
          >
            <TeamIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h6">Ekibim</Typography>
              <Typography variant="h4">-</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Son Projeler */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Son Projeler
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.projects.length > 0 ? (
          stats.projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {project.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {project.description}
                  </Typography>
                  <Chip
                    label={project.status}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    Detaylar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">Henüz hiç proje oluşturulmamış.</Alert>
          </Grid>
        )}
      </Grid>

      {/* Son Görevler */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Son Görevler
      </Typography>
      <Grid container spacing={3}>
        {stats.recentTasks.length > 0 ? (
          stats.recentTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {task.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                    {task.project && (
                      <Chip
                        label={task.project.title}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    Detaylar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">Henüz hiç görev oluşturulmamış.</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
