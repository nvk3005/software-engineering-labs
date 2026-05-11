import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

class UserProfile extends Model {}

UserProfile.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE'),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatarName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserProfile',
    tableName: 'userProfile',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

export default UserProfile;
