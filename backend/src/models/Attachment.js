import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Attachment extends Model {}

Attachment.init({
  type: {
    type: DataTypes.ENUM('IMAGE', 'DOCUMENT', 'OTHER'),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  progressId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Progresses',
      key: 'id'
    }
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Attachment'
});

export default Attachment;
