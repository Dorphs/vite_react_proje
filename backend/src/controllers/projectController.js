import { Project, User } from '../models/index.js';
import { Op } from 'sequelize';

export const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      ownerId: req.user.id
    });

    if (req.body.members) {
      await project.addMembers(req.body.members);
    }

    const projectWithAssociations = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: projectWithAssociations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: {
        [Op.or]: [
          { ownerId: req.user.id },
          { '$members.id$': req.user.id }
        ]
      },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı'
      });
    }

    // Yetki kontrolü
    if (project.ownerId !== req.user.id && 
        !project.members.some(member => member.id === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Bu projeye erişim yetkiniz yok'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı'
      });
    }

    // Yetki kontrolü
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu projeyi düzenleme yetkiniz yok'
      });
    }

    // Proje güncelleme
    await project.update(req.body);

    // Üyeleri güncelle
    if (req.body.members) {
      await project.setMembers(req.body.members);
    }

    // Güncel projeyi getir
    const updatedProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı'
      });
    }

    // Yetki kontrolü
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu projeyi silme yetkiniz yok'
      });
    }

    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Proje başarıyla silindi'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
