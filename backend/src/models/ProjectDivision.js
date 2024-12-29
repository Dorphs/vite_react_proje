import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ProjectDivision extends Model {}

ProjectDivision.init({
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Projects',
      key: 'id'
    }
  },
  divisionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Divisions',
      key: 'id'
    }
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'ProjectDivision'
});

export default ProjectDivision;
