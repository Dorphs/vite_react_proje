import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Progress extends Model {}

Progress.init({
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Departments',
      key: 'id'
    }
  },
  divisionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Divisions',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Progress'
});

export default Progress;
