import { Department, Division, User } from '../models/index.js';

const createOrganization = async () => {
  try {
    // Genel Müdür oluştur
    const generalManager = await User.create({
      name: 'Genel Müdür',
      email: 'gm@deski.gov.tr',
      password: 'Deski123!',
      title: 'Genel Müdür',
      role: 'admin'
    });

    // Daire Başkanlıkları
    const departments = [
      {
        name: 'Bilgi Teknolojileri Daire Başkanlığı',
        divisions: [
          'Yazılım Geliştirme Şube Müdürlüğü',
          'Sistem ve Network Şube Müdürlüğü',
          'Siber Güvenlik Şube Müdürlüğü'
        ]
      },
      {
        name: 'İnsan Kaynakları Daire Başkanlığı',
        divisions: [
          'Personel Şube Müdürlüğü',
          'Eğitim Şube Müdürlüğü',
          'Özlük İşleri Şube Müdürlüğü'
        ]
      },
      {
        name: 'Mali İşler Daire Başkanlığı',
        divisions: [
          'Muhasebe Şube Müdürlüğü',
          'Bütçe Şube Müdürlüğü',
          'Satınalma Şube Müdürlüğü'
        ]
      },
      {
        name: 'Strateji Geliştirme Daire Başkanlığı',
        divisions: [
          'Stratejik Planlama Şube Müdürlüğü',
          'İç Kontrol Şube Müdürlüğü',
          'Performans ve Kalite Şube Müdürlüğü'
        ]
      }
    ];

    // Her daire başkanlığı için
    for (const dept of departments) {
      // Daire başkanı oluştur
      const manager = await User.create({
        name: `${dept.name.split(' ')[0]} Başkanı`,
        email: `${dept.name.split(' ')[0].toLowerCase()}@deski.gov.tr`,
        password: 'Deski123!',
        title: 'Daire Başkanı',
        role: 'admin'
      });

      // Daire başkanlığını oluştur
      const department = await Department.create({
        name: dept.name,
        managerId: manager.id
      });

      // Daire başkanının departmanını güncelle
      await manager.update({ departmentId: department.id });

      // Her şube müdürlüğü için
      for (const divName of dept.divisions) {
        // Şube müdürü oluştur
        const divManager = await User.create({
          name: `${divName.split(' ')[0]} Müdürü`,
          email: `${divName.split(' ')[0].toLowerCase()}@deski.gov.tr`,
          password: 'Deski123!',
          title: 'Şube Müdürü',
          role: 'admin',
          departmentId: department.id
        });

        // Şube müdürlüğünü oluştur
        const division = await Division.create({
          name: divName,
          departmentId: department.id,
          managerId: divManager.id
        });

        // Şube müdürünün birimini güncelle
        await divManager.update({ divisionId: division.id });
      }
    }

    console.log('Organizasyon yapısı başarıyla oluşturuldu');
  } catch (error) {
    console.error('Organizasyon yapısı oluşturulurken hata:', error);
  }
};

export default createOrganization;
