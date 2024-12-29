import { Task, Project, User } from '../models/index.js';

export const createTask = async (req, res) => {
  try {
    // Projeyi kontrol et
    const project = await Project.findByPk(req.body.projectId, {
      include: [
        { model: User, as: 'members' }
      ]
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı'
      });
    }

    // Proje erişim yetkisi kontrolü
    if (project.ownerId !== req.user.id && 
        !project.members?.some(member => member.id === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Bu projeye görev ekleme yetkiniz yok'
      });
    }

    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id
    });

    const taskWithAssociations = await Task.findByPk(task.id, {
      include: [
        { model: Project },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: taskWithAssociations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let whereClause = {};

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: Project },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Project },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    // Proje erişim yetkisi kontrolü
    const project = await Project.findByPk(task.projectId, {
      include: [
        { model: User, as: 'members' }
      ]
    });
    if (project.ownerId !== req.user.id && 
        !project.members?.some(member => member.id === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Bu göreve erişim yetkiniz yok'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    // Proje erişim yetkisi kontrolü
    const project = await Project.findByPk(task.projectId, {
      include: [
        { model: User, as: 'members' }
      ]
    });
    if (project.ownerId !== req.user.id && 
        !project.members?.some(member => member.id === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Bu görevi düzenleme yetkiniz yok'
      });
    }

    await task.update(req.body);

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: Project },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Görev bulunamadı'
      });
    }

    // Proje erişim yetkisi kontrolü
    const project = await Project.findByPk(task.projectId, {
      include: [
        { model: User, as: 'members' }
      ]
    });
    if (project.ownerId !== req.user.id && 
        !project.members?.some(member => member.id === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Bu görevi silme yetkiniz yok'
      });
    }

    await task.destroy();

    res.status(200).json({
      success: true,
      message: 'Görev başarıyla silindi'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
