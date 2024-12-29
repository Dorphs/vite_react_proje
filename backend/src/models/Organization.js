import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Organization extends Model {}

Organization.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Organizations',
      key: 'id'
    }
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Organization'
});

export default Organization;
