import sequelize from '../../config/database.js';
import User from './User.js';
import UserProfile from './UserProfile.js';
import Otp from './Otp.js';

// Khai báo các mối quan hệ (Associations)
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Otp, { foreignKey: 'userId', as: 'otps', onDelete: 'CASCADE' });
Otp.belongsTo(User, { foreignKey: 'userId' });

export { sequelize, User, UserProfile, Otp };

