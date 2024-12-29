import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Project services
export const projectService = {
  createProject: (projectData) => api.post('/projects', projectData),
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, projectData) => api.patch(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

// Task services
export const taskService = {
  createTask: (taskData) => api.post('/tasks', taskData),
  getTasks: (projectId) => api.get('/tasks', { params: { project: projectId } }),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, taskData) => api.patch(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export default api;
