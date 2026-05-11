import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      defaultValue: 'USER',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'),
      defaultValue: 'INACTIVE',
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

export default User;
