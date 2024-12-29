import User from './User.js';
import Department from './Department.js';
import Division from './Division.js';
import Project from './Project.js';
import ProjectDepartment from './ProjectDepartment.js';
import ProjectDivision from './ProjectDivision.js';
import Task from './Task.js';
import Progress from './Progress.js';
import Attachment from './Attachment.js';

// Kullanıcı ilişkileri
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
User.belongsTo(Division, { foreignKey: 'divisionId', as: 'division' });

// Departman ilişkileri
Department.hasMany(Division, { foreignKey: 'departmentId', as: 'divisions' });
Department.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
Department.belongsToMany(Project, { 
  through: { 
    model: ProjectDepartment,
    unique: false
  },
  foreignKey: 'departmentId',
  otherKey: 'projectId',
  as: 'projects' 
});

// Şube ilişkileri
Division.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Division.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
Division.belongsToMany(Project, { 
  through: { 
    model: ProjectDivision,
    unique: false
  },
  foreignKey: 'divisionId',
  otherKey: 'projectId',
  as: 'projects' 
});

// Proje ilişkileri
Project.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Project.belongsToMany(Department, { 
  through: { 
    model: ProjectDepartment,
    unique: false
  },
  foreignKey: 'projectId',
  otherKey: 'departmentId',
  as: 'departments' 
});
Project.belongsToMany(Division, { 
  through: { 
    model: ProjectDivision,
    unique: false
  },
  foreignKey: 'projectId',
  otherKey: 'divisionId',
  as: 'divisions' 
});
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Project.hasMany(Progress, { foreignKey: 'projectId', as: 'progress' });

// Görev ilişkileri
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });
Task.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Task.belongsTo(Division, { foreignKey: 'divisionId', as: 'division' });
Task.hasMany(Progress, { foreignKey: 'taskId', as: 'progress' });

// İlerleme ilişkileri
Progress.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Progress.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Progress.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Progress.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Progress.belongsTo(Division, { foreignKey: 'divisionId', as: 'division' });
Progress.hasMany(Attachment, { foreignKey: 'progressId', as: 'attachments' });

// Dosya ilişkileri
Attachment.belongsTo(Progress, { foreignKey: 'progressId', as: 'progress' });
Attachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

export {
  User,
  Department,
  Division,
  Project,
  ProjectDepartment,
  ProjectDivision,
  Task,
  Progress,
  Attachment
};
