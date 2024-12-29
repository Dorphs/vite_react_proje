import Organization from '../models/Organization.js';

// Tüm organizasyon yapısını getir
export const getOrganizationStructure = async (req, res) => {
  try {
    // Önce tüm organizasyonları seviyelerine göre sıralı şekilde al
    const organizations = await Organization.findAll({
      order: [
        ['level', 'ASC'],
        ['order', 'ASC']
      ]
    });

    // Hiyerarşik yapıyı oluştur
    const buildHierarchy = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item.toJSON(),
          children: buildHierarchy(items, item.id)
        }));
    };

    const hierarchy = buildHierarchy(organizations);

    res.json({
      success: true,
      data: hierarchy
    });
  } catch (error) {
    console.error('getOrganizationStructure error:', error);
    res.status(500).json({
      success: false,
      message: 'Organizasyon yapısı alınırken bir hata oluştu',
      error: error.message
    });
  }
};

// Yeni organizasyon birimi ekle
export const createOrganization = async (req, res) => {
  try {
    const { title, description, parentId, level, order } = req.body;

    // Validasyon
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Birim adı zorunludur'
      });
    }

    if (level < 0) {
      return res.status(400).json({
        success: false,
        message: 'Seviye 0 veya daha büyük olmalıdır'
      });
    }

    if (order < 0) {
      return res.status(400).json({
        success: false,
        message: 'Sıra 0 veya daha büyük olmalıdır'
      });
    }

    // Eğer parentId belirtilmişse, parent'ın varlığını kontrol et
    if (parentId) {
      const parent = await Organization.findByPk(parentId);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen üst birim bulunamadı'
        });
      }
    }

    const organization = await Organization.create({
      title,
      description,
      parentId,
      level,
      order
    });

    res.status(201).json({
      success: true,
      data: organization,
      message: 'Organizasyon birimi başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('createOrganization error:', error);
    res.status(500).json({
      success: false,
      message: 'Organizasyon birimi oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Organizasyon birimini güncelle
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, parentId, level, order } = req.body;

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organizasyon birimi bulunamadı'
      });
    }

    // Validasyon
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Birim adı zorunludur'
      });
    }

    if (level < 0) {
      return res.status(400).json({
        success: false,
        message: 'Seviye 0 veya daha büyük olmalıdır'
      });
    }

    if (order < 0) {
      return res.status(400).json({
        success: false,
        message: 'Sıra 0 veya daha büyük olmalıdır'
      });
    }

    // Eğer parentId belirtilmişse, parent'ın varlığını kontrol et
    if (parentId) {
      const parent = await Organization.findByPk(parentId);
      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Belirtilen üst birim bulunamadı'
        });
      }

      // Kendisini kendi alt birimi yapmaya çalışıyor mu kontrol et
      if (parentId === organization.id) {
        return res.status(400).json({
          success: false,
          message: 'Bir birim kendisinin alt birimi olamaz'
        });
      }
    }

    await organization.update({
      title,
      description,
      parentId,
      level,
      order
    });

    res.json({
      success: true,
      data: organization,
      message: 'Organizasyon birimi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('updateOrganization error:', error);
    res.status(500).json({
      success: false,
      message: 'Organizasyon birimi güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Organizasyon birimini sil
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organizasyon birimi bulunamadı'
      });
    }

    // Alt birimleri kontrol et
    const hasChildren = await Organization.findOne({
      where: { parentId: id }
    });

    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: 'Bu birimin alt birimleri var. Önce alt birimleri silmelisiniz.'
      });
    }

    await organization.destroy();

    res.json({
      success: true,
      message: 'Organizasyon birimi başarıyla silindi'
    });
  } catch (error) {
    console.error('deleteOrganization error:', error);
    res.status(500).json({
      success: false,
      message: 'Organizasyon birimi silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Belirli bir organizasyon birimini getir
export const getOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organizasyon birimi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('getOrganization error:', error);
    res.status(500).json({
      success: false,
      message: 'Organizasyon birimi alınırken bir hata oluştu',
      error: error.message
    });
  }
};
