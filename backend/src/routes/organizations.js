import express from 'express';
import {
  getOrganizationStructure,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganization
} from '../controllers/organizationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tüm rotalar için auth gerekli
router.use(protect);

// Organizasyon yapısını getir (tüm kullanıcılar erişebilir)
router.get('/', getOrganizationStructure);

// Tekil organizasyon birimi getir (tüm kullanıcılar erişebilir)
router.get('/:id', getOrganization);

// Sadece admin ve yöneticiler değişiklik yapabilir
router.post('/', authorize(['admin', 'manager']), createOrganization);
router.put('/:id', authorize(['admin', 'manager']), updateOrganization);
router.delete('/:id', authorize(['admin', 'manager']), deleteOrganization);

export default router;
