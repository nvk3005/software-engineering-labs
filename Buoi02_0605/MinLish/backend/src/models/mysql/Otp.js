import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

export const Otp = sequelize.define('Otp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    otpCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('REGISTER', 'FORGOT_PASSWORD'),
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: 'otps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Otp;
