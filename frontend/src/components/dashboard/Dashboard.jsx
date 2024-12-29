import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme
} from '@mui/material';
import {
  Assignment as ProjectIcon,
  Task as TaskIcon,
  Timeline as TimelineIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 1,
            mr: 2
          }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" component="div">
              {value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ProjectCard = ({ project }) => {
  const theme = useTheme();
  const progress = 65; // Bu değer API'dan gelecek

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {project.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            İlerleme:
          </Typography>
          <Box sx={{ width: '100%', ml: 1 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {progress}%
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Chip 
            label={project.status} 
            size="small"
            color={project.status === 'IN_PROGRESS' ? 'primary' : 'default'}
          />
          <Typography variant="body2" color="text.secondary">
            Bitiş: {new Date(project.endDate).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const TaskList = ({ tasks }) => {
  return (
    <List>
      {tasks.map((task) => (
        <ListItem key={task.id}>
          <ListItemIcon>
            <TaskIcon />
          </ListItemIcon>
          <ListItemText
            primary={task.title}
            secondary={`Durum: ${task.status} | Öncelik: ${task.priority}`}
          />
          <Chip 
            label={task.priority}
            size="small"
            color={task.priority === 'HIGH' ? 'error' : 'default'}
          />
        </ListItem>
      ))}
    </List>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();

  // Bu veriler API'dan gelecek
  const mockData = {
    stats: {
      activeProjects: 12,
      pendingTasks: 25,
      completedTasks: 48,
      upcomingDeadlines: 5
    },
    recentProjects: [
      {
        id: 1,
        title: 'Yazılım Geliştirme Projesi',
        status: 'IN_PROGRESS',
        endDate: '2024-03-15'
      },
      {
        id: 2,
        title: 'Network Altyapı Güncelleme',
        status: 'PENDING',
        endDate: '2024-04-01'
      }
    ],
    recentTasks: [
      {
        id: 1,
        title: 'API Dokümantasyonu',
        status: 'IN_PROGRESS',
        priority: 'HIGH'
      },
      {
        id: 2,
        title: 'Test Senaryoları',
        status: 'TODO',
        priority: 'MEDIUM'
      }
    ]
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Hoş Geldiniz, {user?.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {user?.title} | {user?.department?.name}
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* İstatistik Kartları */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aktif Projeler"
            value={mockData.stats.activeProjects}
            icon={<ProjectIcon sx={{ color: theme.palette.primary.main }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bekleyen Görevler"
            value={mockData.stats.pendingTasks}
            icon={<TaskIcon sx={{ color: theme.palette.warning.main }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tamamlanan Görevler"
            value={mockData.stats.completedTasks}
            icon={<TimelineIcon sx={{ color: theme.palette.success.main }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Yaklaşan Teslim Tarihleri"
            value={mockData.stats.upcomingDeadlines}
            icon={<PriorityIcon sx={{ color: theme.palette.error.main }} />}
            color={theme.palette.error.main}
          />
        </Grid>

        {/* Projeler ve Görevler */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Son Projeler
            </Typography>
            {mockData.recentProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Son Görevler
            </Typography>
            <TaskList tasks={mockData.recentTasks} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
