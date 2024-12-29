import User from '../models/User.js';

const createAdminUser = async () => {
  try {
    // Admin bilgileri
    const adminData = {
      name: 'Admin',
      email: 'admin@deski.gov.tr',
      password: 'Admin123!',
      role: 'admin',
      title: 'Sistem Yöneticisi'
    };

    // Var olan admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ where: { email: adminData.email } });

    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut');
      return;
    }

    // Admin kullanıcısını oluştur
    const admin = await User.create(adminData);

    console.log('Admin kullanıcısı başarıyla oluşturuldu:', admin.email);
  } catch (error) {
    console.error('Admin kullanıcısı oluşturulurken hata:', error);
  }
};

export default createAdminUser;
