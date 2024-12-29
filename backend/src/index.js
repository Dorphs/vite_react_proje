import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import sequelize from './config/database.js';

// Route imports
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import organizationRoutes from './routes/organizations.js';

// Model imports
import './models/index.js';

// Seeder imports
import createAdminUser from './seeders/adminUser.js';
import createOrganization from './seeders/organizationSeeder.js';

dotenv.config();

const app = express();

// CORS ayarları
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Proje Yönetimi API çalışıyor',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      organizations: '/api/organizations'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/organizations', organizationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} bulunamadı`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Database ve sunucuyu başlat
const startServer = async () => {
  try {
    // Veritabanı bağlantısını senkronize et
    await sequelize.sync({ force: true }); // Veritabanını sıfırla
    console.log('Veritabanı bağlantısı başarılı');

    // Admin kullanıcısını oluştur
    await createAdminUser();
    
    // Organizasyon yapısını oluştur
    await createOrganization();

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor`);
      console.log('Test için: http://localhost:' + PORT);
    });
  } catch (error) {
    console.error('Sunucu başlatılırken hata:', error);
    process.exit(1);
  }
};

startServer();
